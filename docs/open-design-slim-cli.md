# Open Design Slim CLI 抽取设计提案

## 状态

本文档最初是 proposal / design-only 状态，用于约束 Open Design Slim CLI 的抽取边界和实施顺序。

当前仓库已落地 MVP Open Design Slim CLI：`package.json` 暴露 `open-design-slim` 与 `od-slim`，`bin/` 提供命令入口，`src/cli.ts` 承载共享 TypeScript 实现，`dist/cli.mjs` 是发布包运行的 JS 产物，`assets/` 承载 CLI 发布所需模板和默认设计系统 snapshot。`sync check/write` 仍保留为后续 deterministic snapshot workflow，不属于当前 MVP。

## 背景

`open-design-slim` skill bundle 的核心入口是 `skills/open-design-slim/SKILL.md`，旁路提供模板、默认设计系统、输出契约、质量检查清单和 `scripts/od-slim.mjs` 自包含 helper。CLI 与 skill bundle 需要分离：CLI 可单独发布；skill helper 只能使用 skill 目录内的相对路径，不能依赖仓库根目录或其它外部路径。

这个形态适合被 coding agent 直接读取和使用，但不适合作为可版本化、可测试、可发布的产品化命令行能力。接下来需要把其中一部分稳定能力抽取成 slim CLI，让用户和 agent 都可以通过统一命令完成本地脚手架、校验、同步检查和交付文件生成。

同时，本仓库包含 `open-design/` submodule。它的角色是上游源代码和资产上下文，不是 Open Design Slim 的 shipped payload。Slim CLI 不能把整个上游运行时塞进自身，也不能依赖上游 daemon、web、desktop 或 product CLI 才能工作。

## 目标

- 提供一个 daemonless、本地文件系统优先的 Open Design Slim CLI。
- 将已经稳定的本地脚手架、校验和 handoff 生成能力产品化为 Open Design Slim CLI。
- 为模板、设计系统、契约和 provenance 建立明确的 source manifest 与同步检查机制。
- 复用上游 Open Design 中可独立消费的纯模块和资产，避免重写已有契约和设计系统资料。
- 保持 Skill guidance layer 可继续工作，并提供只依赖 skill 内文件的自包含 helper。
- 为后续从上游 Open Design exporter 自动生成 slim snapshot 留出路径。

## 非目标

- 不实现完整 Open Design 产品 CLI。
- 不启动、安装、管理或探测 Open Design daemon。
- 不调用网络、不访问 `/api/*`，不依赖 `OD_DAEMON_URL`、`OD_PROJECT_ID`、`OD_TOOL_TOKEN` 或 `OD_DATA_DIR`。
- 不读取或写入 daemon data roots，不创建 project/run/artifact DB，不管理 run history。
- 不做 preview/export/media/plugin/MCP/provider management。
- 不把 `open-design/` submodule 作为最终发布包的一部分。
- 不使用 `open-design/apps/daemon/src/cli.ts` 作为实现基座；它是 full product CLI，默认启动或依赖 daemon concerns。

## 分层边界

Open Design Slim CLI 必须处在三层结构的中间层。

| 层级 | 责任 | 可依赖内容 | 禁止内容 |
| --- | --- | --- | --- |
| Skill guidance layer | 面向 agent 的任务指导、质量规则、输出契约说明 | `SKILL.md`、`references/`、`contracts/`、`quality/`、示例、模板和 `scripts/od-slim.mjs` | 依赖 skill 目录外的 CLI 路径，或假装自己是完整 Open Design runtime |
| Slim CLI local-file layer | 本地脚手架、校验、来源检查、snapshot 同步、handoff 生成 | Open Design Slim CLI package、纯 TS/JS contract 模块、静态 assets、source manifest | daemon、网络、`/api/*`、数据库、provider、MCP、preview/export/media |
| Full Open Design runtime layer | 完整产品能力、daemon、web/desktop、项目和运行态管理 | 上游 `open-design/` 自身 | 被 slim CLI 直接启动或作为运行时依赖 |

这三层的关键约束是：Skill helper 只能读取 `skills/open-design-slim/` 内的本地 snapshot；Slim CLI 读取自己发布包内的本地 snapshot 和纯契约；Full Open Design 可以在未来导出 snapshot。但消费端必须始终 daemonless/local-filesystem-only。

## 抽取范围

### 抽取进 Slim CLI

- `init prototype`：复制静态 HTML、React、deck 模板到目标目录。
- `init design-system`：复制默认设计系统 bundle，并按输入名称更新本地元数据。
- `validate prototype`：检查本地 prototype entry、handoff、状态覆盖、基础 a11y/viewport 信号和 forbidden runtime dependency。
- `validate design-system`：检查设计系统 bundle 文件结构、manifest、tokens、components manifest、provenance。
- `bundle handoff`：生成或刷新 `OPEN_DESIGN_SLIM_HANDOFF.md` 模板。
- `sync check`：基于 source manifest 检查本地 vendor/generated snapshot 是否与 pinned submodule commit 和来源路径一致。
- `sync write`：在维护者显式执行时刷新 generated/vendor snapshot；MVP 可以先只支持 dry-run 或设计阶段定义，不默认执行写入。
- `manifest show`：输出当前 slim bundle 的来源、上游 commit、资产路径、生成时间和校验摘要。

### 保持 Skill-only

- Agent 如何理解任务、选择 artifact 类型、阅读哪些 side files。
- 视觉判断、交互状态是否足够、产品信息架构是否合理等需要 agent 或人工判断的内容。
- 面向不同 coding agent 的安装/触发说明。
- 高层创作建议、反模式解释、设计质量 checklists。
- 任务最终 handoff 的自然语言总结。

Skill layer 可以把 CLI 当作工具，但不能把 CLI 校验结果等同于视觉质量或业务正确性证明。

### 留在上游 Full Open Design

- `od daemon`、web UI、desktop runtime。
- project/run/artifact 生命周期和数据库。
- live preview、iframe bridge、comment mode、browser inspection。
- media generation、export pipeline、plugin execution、marketplace、MCP proxy、provider management。
- `/api/*` 路由、daemon URL 解析、sidecar IPC、Open Design product CLI 子命令。
- 上游完整设计系统库、插件仓库、landing page、部署和打包逻辑。

## MVP 命令面

MVP 命令应覆盖当前 helper 已有能力，并补上来源可追溯检查。

```bash
open-design-slim --help
open-design-slim init prototype --kind static|react|deck --output <dir>
open-design-slim init design-system --output <dir> --name <name>
open-design-slim validate prototype --entry <file> [--dir <dir>]
open-design-slim validate design-system --dir <dir>
open-design-slim bundle handoff --dir <dir>
open-design-slim manifest show [--json]
```

后续命令：

```bash
open-design-slim sync check [--json]
open-design-slim sync write --from-submodule open-design --yes
```

当前 MVP 中，`sync check/write` 仅作为后续 deterministic snapshot workflow 预留，不默认实现写入。

Skill 文档可以引用 skill 内的相对路径 `node scripts/od-slim.mjs ...`，也可以引用已安装的 `open-design-slim ...` 命令；不能引用 `node bin/...`、`../../../src/...` 或其它 skill 目录外路径。

## 上游复用策略

`open-design/` submodule 是源上下文和同步输入，不是运行时依赖或发布负载。Slim CLI 复用上游时只允许消费能脱离 daemon 的纯内容。

优先候选：

- `@open-design/plugin-runtime`：manifest parser、adapter、merge、resolve、validate、digest 等纯逻辑。使用前必须确认构建产物不导入 daemon、web、desktop、Node data-root 或网络调用。
- `@open-design/contracts` 中可纯消费的 schema/type/常量模块。只允许选择不把语义绑到 daemon API 的子集；若某个 contract 文件主要描述 `/api/*` DTO，不应成为 slim CLI 的核心运行依赖。
- selected design-system schema/assets/templates：例如 manifest schema、tokens、components manifest、预览模板、默认设计系统资产。
- 上游文档中的质量规则和输出约束，可以转写或生成到本仓库 snapshot，但必须保留来源记录。

禁止路径：

- 不直接 import `open-design/apps/daemon/src/cli.ts`。
- 不通过 `od` product CLI 调用上游能力。
- 不把上游 daemon/web/desktop 源码作为 slim CLI 运行时 dependency。
- 不在消费端从 submodule 动态读取未固定来源的任意文件。

每个被复用的文件或模块都需要在 source manifest 中记录来源路径、上游 commit、生成方式、校验摘要和 license/provenance 说明。

## Source Manifest 与 Provenance

新增 CLI package 时应引入一个机器可读 manifest，例如：

```text
src/manifest/open-design-slim.sources.json
```

建议字段：

- `upstream.remote`：上游仓库地址。
- `upstream.commit`：当前 pinned submodule commit。
- `entries[].sourcePath`：`open-design/` 内来源路径。
- `entries[].targetPath`：本仓库 generated/vendor snapshot 路径。
- `entries[].kind`：`contract`、`asset`、`template`、`quality-doc`、`schema`。
- `entries[].mode`：`copied`、`transformed`、`generated`、`manual-port`。
- `entries[].hash`：目标文件内容摘要。
- `entries[].provenance`：来源说明、license 说明、人工编辑说明。

设计系统 bundle 内继续保留 `source/provenance.json`，用于描述被生成 artifact 的来源；CLI 自身 source manifest 用于维护 Open Design Slim 与上游的同步关系。两者职责不同，不能混用。

## Upstream Sync 策略

同步策略必须可检查、可审计、可回滚。

1. Pin：`open-design/` submodule 固定到一个明确 commit，维护者升级时通过普通 submodule diff 体现。
2. Check：`open-design-slim sync check` 读取 source manifest，确认每个 sourcePath 存在、上游 commit 匹配、目标 snapshot hash 匹配。
3. Write：`open-design-slim sync write` 根据 manifest 刷新 generated/vendor snapshot，并更新 hash、生成时间和 provenance。写入必须显式确认，不能在普通 validate 中隐式发生。
4. Review：snapshot 变更以普通 git diff review，不修改 `open-design/` submodule 内容。
5. Publish：CLI 发布包包含 package、`bin/`、`src/`、CLI `assets/`、source manifest 和必要 docs；Skill bundle 独立分发时包含 `scripts/od-slim.mjs` 自包含 helper；两者都不包含 `open-design/`。

短期可以先手工维护 manifest 与 snapshot；中期把 `sync write` 做成确定性生成；长期由上游 full Open Design exporter 输出同样的 slim folder shape。

## Proposed Repo/Package Structure

建议结构：

```text
.
  docs/
    open-design-slim-cli.md
  packages/
    open-design-slim-cli/
      package.json
      dist/
        cli.mjs
      src/
        cli.ts
        commands/
          init-prototype.ts
          init-design-system.ts
          validate-prototype.ts
          validate-design-system.ts
          bundle-handoff.ts
          manifest-show.ts
          sync-check.ts
          sync-write.ts
        lib/
          fs.ts
          validation.ts
          forbidden-runtime-deps.ts
          provenance.ts
          source-manifest.ts
        manifest/
          open-design-slim.sources.json
      assets/
        templates/
        design-systems/
      tests/
  skills/
    open-design-slim/
      scripts/
        od-slim.mjs
```

MVP 可以不急于拆出 monorepo workspace，但逻辑上应先形成 package 边界：CLI 源码、发布 JS、assets snapshot、source manifest、tests 独立于 Skill guidance 文档。Skill bundle 里的 `scripts/od-slim.mjs` 是构建产物，只能使用 skill 目录内的 `assets/`。

## 分阶段计划与验收标准

### Phase 0：设计冻结

- 完成本文档并经过 review。
- 明确禁止使用 `apps/daemon/src/cli.ts` 作为实现基座。
- 明确 `open-design/` 是 source context only，不是 shipped payload。
- 验收：docs 中覆盖 goals/non-goals、分层边界、抽取范围、MVP 命令、同步策略、风险和验证计划。

### Phase 1：Package 骨架与 Skill 分离

- 新增 CLI package 骨架和本地命令路由。
- 将 CLI 所需模板和默认设计系统 snapshot 放入 package `assets/`。
- 为 Skill 生成自包含 `scripts/od-slim.mjs`，运行时只读取 skill 内 `assets/`。
- 不引入 daemon、network、`/api/*` 依赖。
- 验收：package CLI 和 skill helper 的 `--help` 都可运行；Skill 文档中无 skill 外路径；依赖检查确认无 daemon/web/desktop import。

当前实现使用根目录 `src/cli.ts` 承载命令逻辑，`dist/cli.mjs` 是 package CLI 的可发布 JS，`bin/*.mjs` 是 CLI package 入口，`assets/` 是 CLI package 的可发布资产，`skills/open-design-slim/scripts/od-slim.mjs` 是由 esbuild 生成的 skill 内 helper。维护者应通过 `pnpm run build`、`pnpm run check:generated`、`pnpm run check:assets`、`pnpm run test` 或 `pnpm run check` 验证源码、生成产物、资产同步和负例行为。

### Phase 2：迁移 init/validate/handoff

- 把当前 helper 的 prototype/design-system init、validate、handoff 能力迁入 package。
- 引入单元测试和 fixture。
- 验收：当前默认设计系统和模板通过 CLI 校验；故意包含 `/api/*` 或 `apps/daemon/src` 的 fixture 会失败。

### Phase 3：Source manifest 与 sync check

- 建立 `open-design-slim.sources.json`。
- 实现 `manifest show` 和 `sync check`。
- 验收：pinned submodule commit、sourcePath、targetPath、hash、provenance 均可被机器读取；submodule commit 或 snapshot drift 会被检查发现。

### Phase 4：Sync write 与 generated/vendor snapshot

- 实现显式 `sync write`，只刷新 manifest 声明的文件。
- 输出稳定 diff，不写入 `open-design/`。
- 验收：同一上游 commit 下重复运行无 diff；升级 submodule 后生成的 diff 可 review；发布包不包含 submodule。

### Phase 5：Future exporter 对接

- 在上游 full Open Design 侧提供 exporter，生成与本仓库一致的 slim folder shape。
- Slim CLI 继续只消费生成后的本地 snapshot。
- 验收：exporter 产物通过 `open-design-slim sync check` 和本地 validate；消费端仍不需要 daemon。

## 风险与取舍

- 复用范围过大：直接依赖 `@open-design/contracts` 全包可能带入 daemon/API 语义。取舍是按子模块白名单消费，并用 import 检查守住边界。
- Snapshot 漂移：手工复制资产容易和上游不一致。取舍是引入 source manifest、hash 和 `sync check`，把漂移显性化。
- 双发布面维护成本：CLI package 与 Skill bundle 都包含模板和默认设计系统 snapshot。取舍是让 CLI 可独立发布，让 Skill 可脱离外部安装直接运行自包含 helper，并用 source manifest 暴露同步边界。
- CLI 校验不等于视觉验收：本地文本检查无法证明视觉质量。取舍是 CLI 只证明文件契约，视觉 QA 继续由 browser/screenshot/manual review 覆盖。
- 上游演进带来的 contract 变化：pinned submodule commit 会降低自动漂移，但升级时需要 review。取舍是牺牲自动跟随，换取可审计同步。
- Package 边界过早复杂化：一开始拆 workspace 可能增加维护成本。取舍是先定义 package 边界和目录，再按实现阶段落地构建系统。

## 验证计划

### 设计阶段

- 只做文档和只读检查，不实现 CLI code。
- 检查本文档包含关键边界词：`daemonless`、`/api/*`、`apps/daemon/src/cli.ts`、`sync`、`provenance`、`od-slim`、`open-design-slim`。
- 检查当前 git 状态，确认没有修改 `open-design/` submodule。
- 人工 review 本文档是否覆盖目标、非目标、层次边界、命令面、复用策略、同步策略、阶段计划和风险。

### 实现阶段

- 单元测试：参数解析、命令路由、manifest 读取、hash 计算、forbidden runtime dependency 扫描。
- Fixture 测试：有效 prototype/design-system 通过；包含 `/api/*`、`apps/daemon/src`、`OD_DAEMON_URL`、product `od` 子命令的 fixture 失败。
- Snapshot 测试：`sync check` 能检测 submodule commit drift、sourcePath 缺失、target hash 变化。
- Skill 引用测试：`skills/open-design-slim/` 内不出现 `node bin/...`、`../../../src/...` 或其它 skill 外路径；允许 `node scripts/od-slim.mjs ...`。
- 包内容检查：发布包不包含 `open-design/`，不包含 daemon/web/desktop 源码，不包含 daemon data roots。
- 只读 smoke：在没有 Open Design daemon、没有网络、没有 `/api/*` 的环境中完成 init、validate、manifest show。
