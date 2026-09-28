const KEY = "summer-traces-v1";
const MOODS = ["晴朗", "轻快", "平静", "低落", "疲惫"];
const PERIODS = ["morning", "afternoon", "night"];
const clone = (value) => JSON.parse(JSON.stringify(value));
const dateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const id = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
const validDate = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  dateKey(new Date(`${value}T12:00:00`)) === value;
function createStore(adapter) {
  let db = adapter.get(KEY) || { schema: 1, active: "", accounts: [] };
  function commit(next) {
    adapter.set(KEY, clone(next));
    db = next;
  }
  function account() {
    const a = db.accounts.find((a) => a.id === db.active);
    if (!a) throw Error("请先进入本地账户");
    return clone(a);
  }
  function update(fn) {
    const next = clone(db);
    const a = next.accounts.find((a) => a.id === next.active);
    if (!a) throw Error("请先进入本地账户");
    fn(a);
    commit(next);
    return clone(a);
  }
  function visible(e) {
    return !e.deletedAt && (!e.unlockDate || e.unlockDate <= dateKey());
  }
  function safeEntry(e, entries) {
    return {
      ...e,
      replies: (e.replies || []).filter(
        (r) =>
          !r.sources ||
          r.sources.every((s) =>
            entries.some((x) => x.id === s.id && visible(x)),
          ),
      ),
    };
  }
  function get(entryId, allowLocked = false) {
    const entries = account().entries;
    const e = entries.find((e) => e.id === entryId && !e.deletedAt);
    if (!e) throw Error("记录不存在");
    if (!allowLocked && !visible(e)) throw Error("时光胶囊还未到开启日期");
    return safeEntry(e, entries);
  }
  return {
    account,
    visible,
    get,
    accounts: () =>
      db.accounts.map((a) => ({
        id: a.id,
        name: a.name,
        demo: a.demo,
        avatar: a.avatar,
      })),
    active: () => db.active,
    create(name, demo = false) {
      name = String(name || "")
        .trim()
        .slice(0, 24);
      if (!name) throw Error("请输入昵称");
      const a = {
        id: id(),
        name,
        demo,
        avatar: "sprout",
        entries: [],
        draft: null,
        settings: {
          theme: "day",
          motion: true,
          haptic: false,
          tone: "gentle",
          proxy: "http://127.0.0.1:8787",
          lastBackupAt: 0,
        },
        achievements: [],
        metrics: {},
      };
      commit({ ...db, active: a.id, accounts: [...db.accounts, a] });
      return a;
    },
    switch(accountId) {
      if (!db.accounts.some((a) => a.id === accountId))
        throw Error("账户不存在");
      commit({ ...db, active: accountId });
    },
    logout() {
      commit({ ...db, active: "" });
    },
    removeAccount(accountId) {
      commit({
        ...db,
        active: db.active === accountId ? "" : db.active,
        accounts: db.accounts.filter((a) => a.id !== accountId),
      });
    },
    avatar(value) {
      if (!["sprout", "sun", "coffee", "shell"].includes(value))
        throw Error("头像无效");
      return update((a) => {
        a.avatar = value;
      });
    },
    settings(patch) {
      return update((a) => {
        a.settings = { ...a.settings, ...patch };
      });
    },
    draft(value) {
      return update((a) => {
        a.draft = value;
      });
    },
    unlock(key) {
      update((a) => {
        if (!a.achievements.includes(key)) a.achievements.push(key);
      });
    },
    track(key) {
      if (!["review", "card", "prompt", "backup"].includes(key))
        throw Error("未知的奇物进度");
      return update((a) => {
        a.metrics = a.metrics || {};
        a.metrics[key] = Math.min(
          999999,
          Math.max(0, Number(a.metrics[key]) || 0) + 1,
        );
        if (
          ["review", "card"].includes(key) &&
          !a.achievements.includes(key)
        )
          a.achievements.push(key);
      });
    },
    list({
      query = "",
      mood = "",
      tag = "",
      date = "",
      favorites = false,
    } = {}) {
      const entries = account().entries;
      return entries
        .filter(visible)
        .filter(
          (e) =>
            (!query ||
              `${e.title} ${e.body} ${e.tags.join(" ")}`
                .toLowerCase()
                .includes(query.toLowerCase())) &&
            (!mood || e.mood === mood) &&
            (!tag || e.tags.includes(tag)) &&
            (!date || e.date === date) &&
            (!favorites || e.favorite),
        )
        .sort(
          (a, b) => b.date.localeCompare(a.date) || b.updatedAt - a.updatedAt,
        )
        .map((e) => safeEntry(e, entries));
    },
    capsules: () =>
      account()
        .entries.filter((e) => !e.deletedAt && e.unlockDate)
        .map((e) => ({
          id: e.id,
          title: e.title,
          unlockDate: e.unlockDate,
          locked: !visible(e),
        })),
    trash: () => account().entries.filter((e) => e.deletedAt),
    save(input) {
      const body = String(input.body || "").trim(),
        title = String(input.title || "").trim();
      if (!body && !(input.photos || []).length)
        throw Error("写一点文字或添加一张照片吧");
      if (body.length > 12000 || title.length > 80)
        throw Error("标题限 80 字，正文限 12000 字");
      if (!validDate(input.date)) throw Error("日期格式不正确");
      if (input.unlockDate && !validDate(input.unlockDate))
        throw Error("开启日期格式不正确");
      const entryId = input.id || id();
      update((a) => {
        const old = a.entries.find((e) => e.id === entryId);
        if (old && !visible(old)) throw Error("无法编辑未开启或已删除的记录");
        const now = Math.max(Date.now(), old ? old.updatedAt + 1 : 0);
        const versions = old ? old.versions.slice() : [];
        if (old && (old.body !== body || old.title !== title))
          versions.unshift({
            title: old.title,
            body: old.body,
            at: old.updatedAt,
          });
        const entry = {
          id: entryId,
          title,
          body,
          date: input.date,
          mood: MOODS.includes(input.mood) ? input.mood : "平静",
          period: PERIODS.includes(input.period) ? input.period : "afternoon",
          tags: [
            ...new Set(
              (input.tags || []).map((t) => String(t).trim()).filter(Boolean),
            ),
          ].slice(0, 8),
          photos: (input.photos || []).slice(0, 6),
          favorite: old ? old.favorite : false,
          unlockDate: old ? old.unlockDate : input.unlockDate || "",
          deletedAt: 0,
          versions: versions.slice(0, 10),
          replies: old ? old.replies : [],
          createdAt: old ? old.createdAt : now,
          updatedAt: now,
          color: old ? old.color : "",
        };
        a.entries = [...a.entries.filter((e) => e.id !== entryId), entry];
        a.draft = null;
        const badges = [
          "first",
          ...(entry.photos.length ? ["photo"] : []),
          ...(entry.unlockDate ? ["capsule"] : []),
          ...(new Set(a.entries.filter((e) => !e.deletedAt).map((e) => e.date))
            .size >= 3
            ? ["days"]
            : []),
        ];
        a.achievements = [...new Set([...a.achievements, ...badges])];
      });
      return entryId;
    },
    favorite(entryId) {
      get(entryId);
      update((a) => {
        const e = a.entries.find((e) => e.id === entryId);
        e.favorite = !e.favorite;
      });
    },
    delete(entryId) {
      get(entryId, true);
      update((a) => {
        a.entries.find((e) => e.id === entryId).deletedAt = Date.now();
      });
    },
    restore(entryId) {
      update((a) => {
        const e = a.entries.find((e) => e.id === entryId);
        if (e) e.deletedAt = 0;
      });
    },
    purge(entryId) {
      update((a) => {
        a.entries = a.entries.filter((e) => e.id !== entryId);
      });
    },
    restoreVersion(entryId, index) {
      const e = get(entryId);
      const v = e.versions[index];
      if (!v) throw Error("历史版本不存在");
      return this.save({ ...e, title: v.title, body: v.body });
    },
    related(entryId) {
      const e = get(entryId);
      return this.list()
        .filter((x) => x.id !== entryId)
        .map((x) => {
          const common = x.tags.filter((t) => e.tags.includes(t));
          const union = new Set([...x.tags, ...e.tags]);
          return {
            ...x,
            common,
            score: union.size ? common.length / union.size : 0,
          };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    },
    addReply(owner, entryId, version, reply) {
      if (owner !== db.active) throw Error("账户已切换，回信未保存");
      const e = get(entryId);
      if (e.updatedAt !== version) throw Error("记录已修改，请重新生成");
      update((a) => {
        a.entries
          .find((x) => x.id === entryId)
          .replies.unshift({ ...reply, id: id(), at: Date.now(), version });
        a.entries.find((x) => x.id === entryId).replies = a.entries
          .find((x) => x.id === entryId)
          .replies.slice(0, 20);
      });
    },
    applySuggestions(entryId, reply) {
      get(entryId);
      update((a) => {
        const e = a.entries.find((x) => x.id === entryId);
        if (reply.version !== e.updatedAt)
          throw Error("正文已变化，请重新生成建议");
        e.suggestionUndo = {
          title: e.title,
          tags: e.tags.slice(),
          color: e.color,
        };
        e.tags = [...new Set([...e.tags, ...(reply.tags || [])])].slice(0, 8);
        if (reply.title) {
          e.versions.unshift({ title: e.title, body: e.body, at: e.updatedAt });
          e.versions = e.versions.slice(0, 10);
          e.title = reply.title;
        }
        e.color = reply.color || "";
        e.updatedAt = Math.max(Date.now(), e.updatedAt + 1);
      });
    },
    undoSuggestions(entryId) {
      get(entryId);
      update((a) => {
        const e = a.entries.find((x) => x.id === entryId);
        if (!e.suggestionUndo) throw Error("没有可撤销的建议");
        Object.assign(e, e.suggestionUndo);
        delete e.suggestionUndo;
        e.updatedAt = Math.max(Date.now(), e.updatedAt + 1);
      });
    },
    exportAccount: () => ({
      schema: 1,
      exportedAt: Date.now(),
      account: account(),
    }),
    importAccount(data) {
      if (
        !data ||
        data.schema !== 1 ||
        !data.account ||
        !Array.isArray(data.account.entries) ||
        data.account.entries.length > 1000
      )
        throw Error("备份格式不支持或记录过多");
      const a = data.account;
      if (new Set(a.entries.map((e) => e.id)).size !== a.entries.length)
        throw Error("备份包含重复记录编号");
      for (const e of a.entries) {
        if (
          typeof e.id !== "string" ||
          typeof e.body !== "string" ||
          e.body.length > 12000 ||
          typeof e.title !== "string" ||
          e.title.length > 80 ||
          !validDate(e.date) ||
          (e.unlockDate && !validDate(e.unlockDate)) ||
          !Array.isArray(e.tags) ||
          e.tags.some((t) => typeof t !== "string") ||
          !Array.isArray(e.photos) ||
          e.photos.length > 6 ||
          e.photos.some(
            (p) =>
              typeof p !== "string" ||
              (!p.startsWith("/assets/") &&
                !p.startsWith(adapter.userPath || "wxfile://")),
          )
        )
          throw Error("备份记录校验失败");
      }
      const entries = a.entries.map((e) => ({
        id: e.id,
        title: e.title,
        body: e.body,
        date: e.date,
        mood: MOODS.includes(e.mood) ? e.mood : "平静",
        period: PERIODS.includes(e.period) ? e.period : "afternoon",
        tags: e.tags.slice(0, 8),
        photos: e.photos,
        favorite: !!e.favorite,
        unlockDate: e.unlockDate || "",
        deletedAt: Number.isFinite(e.deletedAt) ? e.deletedAt : 0,
        createdAt: Number.isFinite(e.createdAt) ? e.createdAt : Date.now(),
        updatedAt: Number.isFinite(e.updatedAt) ? e.updatedAt : Date.now(),
        color: /^#[0-9a-f]{6}$/i.test(e.color || "") ? e.color : "",
        versions: Array.isArray(e.versions)
          ? e.versions
              .filter(
                (v) =>
                  v &&
                  typeof v.body === "string" &&
                  v.body.length <= 12000 &&
                  typeof v.title === "string" &&
                  v.title.length <= 80,
              )
              .slice(0, 10)
              .map((v) => ({
                body: v.body,
                title: v.title,
                at: Number(v.at) || 0,
              }))
          : [],
        replies: Array.isArray(e.replies)
          ? e.replies
              .filter(
                (r) =>
                  r && typeof r.reply === "string" && r.reply.length <= 6000,
              )
              .slice(0, 20)
              .map((r) => ({
                id: typeof r.id === "string" ? r.id : id(),
                at: Number(r.at) || 0,
                version: Number(r.version) || 0,
                reply: r.reply,
                alternateReply:
                  typeof r.alternateReply === "string"
                    ? r.alternateReply.slice(0, 6000)
                    : "",
                tone: String(r.tone || "gentle"),
                mode: String(r.mode || "reply"),
                title: typeof r.title === "string" ? r.title.slice(0, 80) : "",
                tags: Array.isArray(r.tags)
                  ? r.tags.filter((t) => typeof t === "string").slice(0, 5)
                  : [],
                color: /^#[0-9a-f]{6}$/i.test(r.color || "") ? r.color : "",
                colorName:
                  typeof r.colorName === "string"
                    ? r.colorName.slice(0, 20)
                    : "",
                sources: Array.isArray(r.sources)
                  ? r.sources
                      .filter((s) => s && typeof s.id === "string")
                      .map((s) => ({
                        id: s.id,
                        version: Number(s.version) || 0,
                      }))
                  : [{ id: e.id, version: Number(r.version) || 0 }],
              }))
          : [],
      }));
      const next = {
        id: id(),
        name: String(a.name || "导入手账").slice(0, 20) + " · 导入",
        demo: false,
        avatar: ["sprout", "sun", "coffee", "shell"].includes(a.avatar)
          ? a.avatar
          : "sprout",
        entries,
        draft: null,
        settings: {
          theme: ["day", "morning", "night", "auto"].includes(
            a.settings && a.settings.theme,
          )
            ? a.settings.theme
            : "day",
          motion: true,
          haptic: false,
          tone: "gentle",
          proxy: "http://127.0.0.1:8787",
          lastBackupAt: Number(a.settings && a.settings.lastBackupAt) || 0,
        },
        achievements: Array.isArray(a.achievements)
          ? a.achievements.filter((k) =>
              ["first", "photo", "days", "capsule", "review", "card"].includes(
                k,
              ),
            )
          : [],
        metrics: Object.fromEntries(
          ["review", "card", "prompt", "backup"].map((key) => [
            key,
            Math.min(
              999999,
              Math.max(0, Number(a.metrics && a.metrics[key]) || 0),
            ),
          ]),
        ),
      };
      commit({ ...db, active: next.id, accounts: [...db.accounts, next] });
      return next.id;
    },
  };
}
module.exports = { createStore, dateKey, MOODS, PERIODS, validDate };
