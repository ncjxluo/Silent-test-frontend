<template>
  <div class="page-wrapper">
    <div
      style="display: flex; justify-content: space-between; align-items: center"
      class="mt-2 mb-2"
    >
      <el-breadcrumb :separator-icon="ArrowRight" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '#' }" @click="goPage('list', null)">
          用例项目列表
        </el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentPage === 'detail' || currentPage === 'table'">
          用例项目详情
        </el-breadcrumb-item>
      </el-breadcrumb>
      <div
        v-if="currentPage === 'detail' || currentPage === 'table'"
        class="env-switcher flex items-center gap-2 mr-2"
      >
        <el-select
          v-model="currentAgent"
          placeholder="请选择执行节点"
          style="width: 220px"
          popper-class="env-popper"
          size="small"
        >
          <el-option
            v-for="item in agentList"
            :key="item.agent_key"
            :label="item.agent_name"
            :value="item.agent_key"
          >
            <span style="float: left">{{ item.agent_name }}</span>
            <span
              style="float: right; font-size: 13px; margin-left: 2px"
              :style="{ color: getAgentStatusColor(item.agent_status) }"
            >
              {{ getAgentStatus(item.agent_status) }}
            </span>
          </el-option>
        </el-select>
        <el-switch
          v-model="page_switch"
          class="ml-2"
          inline-prompt
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #409eff"
          active-text="设计"
          inactive-text="表格"
          @change="pageSwitchChange"
        />
      </div>
    </div>

    <div class="content-box">
      <!-- 列表页 -->
      <div v-if="currentPage === 'list'" class="list-page">
        <div class="top-bar">
          <div class="page-title"></div>
          <el-button type="primary" @click="handleAddCaseProject">
            <el-icon><Plus /></el-icon>
            创建项目
          </el-button>
        </div>

        <div class="project-card-list">
          <el-empty v-if="case_project_data.length === 0" description="暂无项目" :image-size="80" />
          <el-space wrap size="large">
            <el-card
              v-for="item in case_project_data"
              :key="item.case_project_key"
              class="project-card"
              shadow="hover"
              @click="goPage('detail', item)"
            >
              <template #header>
                <div class="card-header">
                  <div class="card-title">{{ item.case_project_name }}</div>
                  <div class="card-actions">
                    <el-button
                      class="action-btn edit-btn"
                      text
                      size="small"
                      @click.stop="handleCaseProjectEdit(item)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      class="action-btn delete-btn"
                      text
                      size="small"
                      @click.stop="handleCaseProjectDelete(item)"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
              </template>
              <div class="card-content">
                <div class="content-item">
                  <span class="label">项目描述：</span>
                  <span class="value single-line">{{ item.case_project_desc }}</span>
                </div>
                <div class="content-item">
                  <span class="label">创建人：</span>
                  <span class="value">{{
                    mapKeyToLabel(item.user_key, tableDatas, 'user_key', 'nickname') || '未知'
                  }}</span>
                </div>
              </div>
            </el-card>
          </el-space>
        </div>

        <!-- 对话框保持不变 -->
        <general-dialog
          ref="CaseProjectGeneralDialogRef"
          :title="case_project_dialog_title"
          :width="500"
          :confirmText="case_project_dialog_button_text"
          btype="primary"
          @confirm="handleCaseProjectNew"
        >
          <el-form
            :model="case_project_form"
            label-width="120px"
            :rules="case_project_rules"
            ref="case_projectFormRef"
          >
            <el-form-item label="用例项目名" prop="case_project_name">
              <el-input
                v-model="case_project_form.case_project_name"
                placeholder="请输入用例项目名"
              />
            </el-form-item>
            <el-form-item label="用例项目描述">
              <el-input
                v-model="case_project_form.case_project_desc"
                type="textarea"
                :rows="3"
                placeholder="请输入用例项目描述"
              />
            </el-form-item>
          </el-form>
        </general-dialog>

        <general-dialog
          ref="DelCaseProjectDialogRef"
          title="删除项目"
          :width="400"
          confirmText="确定删除"
          btype="danger"
          @confirm="delCaseProjectConfirm"
        >
          <div class="delete-confirm">
            <el-icon size="48" color="#F56C6C"><Warning /></el-icon>
            <p>确定要删除项目吗？</p>
            <p class="sub-text">删除项目会同步删除项目下的所有内容，此操作不可恢复</p>
          </div>
        </general-dialog>
      </div>
      <!-- 详情页 -->
      <div v-else-if="currentPage === 'detail'" class="detail-page">
        <el-splitter class="main-splitter">
          <!-- 左侧树区域 -->
          <el-splitter-panel class="left-panel" size="20%">
            <div class="left-container">
              <div class="left-header">
                <span style="font-size: 14px">用例管理</span>
                <el-dropdown @command="handleCaseBranchSwitch" trigger="click">
                  <div class="project-switcher">
                    <div class="project-info">
                      <el-icon><Icon icon="oui:branch" /></el-icon>
                      <span class="project-name">{{ currentCaseBranch?.case_branch_name }}</span>
                    </div>
                  </div>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="branch in case_branch_data"
                        :key="branch.case_branch_key"
                        :command="branch"
                      >
                        <div class="project-item">
                          <div style="gap: 6px">
                            <el-icon><Icon icon="oui:branch" width="8" height="8" /></el-icon>
                            <span> {{ branch.case_branch_name }}</span>
                          </div>
                          <el-tag
                            v-if="branch.case_branch_key === currentCaseBranch?.case_branch_key"
                            size="small"
                            type="success"
                            >当前</el-tag
                          >
                        </div>
                      </el-dropdown-item>
                      <el-dropdown-item command="create" divided>
                        <el-icon><Plus /></el-icon> 创建分支
                      </el-dropdown-item>
                      <el-dropdown-item command="manage">
                        <el-icon><Setting /></el-icon> 管理分支
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>

              <!-- 搜索 + 新建 -->
              <div class="left-toolbar">
                <el-input v-model="keyword" placeholder="搜索用例" />
                <el-dropdown @command="handleDropdownCommand">
                  <el-button type="primary" :icon="Plus" size="small" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="addApi">新建用例</el-dropdown-item>
                      <el-dropdown-item command="addGroup">新建分组</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>

              <!-- 树 - 滚动区域 -->
              <div class="tree-scroll-wrapper">
                <el-scrollbar>
                  <el-empty
                    v-if="currentCaseBranch?.case_branch_key === '0'"
                    description="暂无数据"
                    :image-size="80"
                  />
                  <el-tree
                    v-else
                    :data="filteredTreeData"
                    node-key="folder_key"
                    :props="defaultProps"
                    @node-click="handleTreeItemClick"
                    :default-expanded-keys="expandedKeys"
                    draggable
                    :expand-on-click-node="true"
                    :default-expand-all="false"
                    class="api-tree"
                  >
                    <template #default="{ node, data }">
                      <div class="custom-tree-node">
                        <div class="node-main">
                          <el-icon
                            class="node-icon"
                            :class="data.type === 'group' ? 'group-icon' : 'api-icon'"
                          >
                            <Folder v-if="data.type === 'group'" />
                            <Document v-else />
                          </el-icon>
                          <span class="node-label">{{ node.label }}</span>
                        </div>

                        <div class="node-actions" @click.stop>
                          <el-dropdown
                            trigger="click"
                            @command="(cmd: any) => handleNodeCommand(cmd, data)"
                          >
                            <el-button type="text" size="small" :icon="MoreFilled" />
                            <template #dropdown>
                              <el-dropdown-menu>
                                <template v-if="data.type === 'case'">
                                  <el-dropdown-item command="rename_api"
                                    ><el-icon><Edit /></el-icon> 重命名</el-dropdown-item
                                  >
                                  <el-dropdown-item command="copy_api"
                                    ><el-icon><CopyDocument /></el-icon> 复制</el-dropdown-item
                                  >
                                  <el-dropdown-item command="move_api"
                                    ><el-icon><CopyDocument /></el-icon> 移动</el-dropdown-item
                                  >
                                  <el-dropdown-item command="delete_api" divided
                                    ><el-icon><Delete /></el-icon> 删除</el-dropdown-item
                                  >
                                </template>
                                <template v-else>
                                  <el-dropdown-item command="rename_group"
                                    ><el-icon><Edit /></el-icon> 重命名分组</el-dropdown-item
                                  >
                                  <el-dropdown-item command="add_api"
                                    ><el-icon><Plus /></el-icon> 新建用例</el-dropdown-item
                                  >
                                  <el-dropdown-item command="delete_group" divided
                                    ><el-icon><Delete /></el-icon> 删除分组</el-dropdown-item
                                  >
                                </template>
                              </el-dropdown-menu>
                            </template>
                          </el-dropdown>
                        </div>
                      </div>
                    </template>
                  </el-tree>
                </el-scrollbar>
              </div>

              <!-- 底部固定：项目切换 -->
              <div class="left-footer">
                <el-dropdown @command="handleProjectSwitch" style="width: 100%" trigger="click">
                  <div class="project-switcher">
                    <div class="project-info">
                      <el-icon><Files /></el-icon>
                      <span class="project-name">{{ currentcaseProject!.case_project_name }}</span>
                    </div>
                    <el-icon><CaretBottom /></el-icon>
                  </div>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="project in case_project_data"
                        :key="project.case_project_key"
                        :command="project"
                      >
                        <div class="project-item">
                          <span>{{ project.case_project_name }}</span>
                          <el-tag
                            v-if="project.case_project_key === currentcaseProject!.case_project_key"
                            size="small"
                            type="success"
                            >当前</el-tag
                          >
                        </div>
                      </el-dropdown-item>
                      <el-dropdown-item command="manage" divided>
                        <el-icon><Setting /></el-icon> 用例项目管理
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </el-splitter-panel>
          <el-splitter-panel>
            <div class="h-full flex flex-col">
              <!-- 用例 tabs（多用例切换） -->
              <el-tabs
                v-model="activeTab"
                type="card"
                closable
                @tab-remove="removeTab"
                class="!mb-0"
                addable
                @tab-add="addtab"
              >
                <el-tab-pane
                  v-for="tab in tabs"
                  :key="tab.case_key"
                  :label="renderTabLabel(tab)"
                  :name="tab.case_key"
                />
              </el-tabs>
              <div class="flex-1 overflow-hidden bg-white">
                <div v-if="currentTab" class="h-full flex flex-col">
                  <el-splitter class="h-full flex overflow-hidden border-t">
                    <el-splitter-panel
                      size="20%"
                      class="border-r border-gray-200 bg-white flex flex-col"
                    >
                      <div
                        class="px-4 py-3 border-b flex items-center gap-2 bg-gray-50 font-medium"
                      >
                        <Icon icon="tabler:list-tree" width="24" height="24" />
                        <span>测试计划树</span>
                      </div>

                      <div class="flex-1 overflow-auto p-2 bg-white">
                        <el-tree
                          ref="treeRef"
                          :data="currentTab.treeData"
                          :props="treeProps"
                          node-key="id"
                          highlight-current
                          :expand-on-click-node="false"
                          :default-expanded-keys="expandejmeterKeys"
                          @node-click="handleNodeClick"
                          @node-contextmenu="handleContextMenu"
                          class="jmeter-tree"
                        >
                          <template #default="{ node }">
                            <div class="flex items-center gap-2 text-sm py-0.5">
                              <Icon
                                v-if="node.data.component_category === 'testplan'"
                                icon="vscode-icons:file-type-testplane"
                                width="16"
                                height="16"
                              />
                              <Icon
                                v-if="node.data.component_category === 'sampler'"
                                icon="ph:eyedropper-sample-duotone"
                                width="16"
                                height="16"
                              />
                              <Icon
                                v-if="node.data.component_category === 'configelement'"
                                icon="icon-park-outline:config"
                                width="16"
                                height="16"
                              />
                              <Icon
                                v-if="node.data.component_category === 'postprocessors'"
                                icon="basil:processor-outline"
                                width="16"
                                height="16"
                              />
                              <Icon
                                v-if="node.data.component_category === 'preprocessors'"
                                icon="marketeq:processor"
                                width="16"
                                height="16"
                              />
                              <Icon
                                v-if="node.data.component_category === 'logiccontroller'"
                                icon="carbon:logical-partition"
                                width="16"
                                height="16"
                              />
                              <Icon
                                v-if="node.data.component_category === 'thread'"
                                icon="logos:threads"
                                width="16"
                                height="16"
                              />
                              <Icon
                                v-if="node.data.component_category === 'timer'"
                                icon="bx:timer"
                                width="16"
                                height="16"
                              />
                              <Icon
                                v-if="node.data.component_category === 'assertion'"
                                icon="material-symbols-light:fire-check-rounded"
                                width="16"
                                height="16"
                              />
                              <Icon
                                v-if="node.data.component_category === 'listener'"
                                icon="carbon:load-balancer-listener"
                                width="16"
                                height="16"
                              />
                              <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="node.data.props_values.name"
                                placement="top"
                              >
                                <span class="truncate">{{ node.data.label }}</span>
                              </el-tooltip>
                            </div>
                          </template>
                        </el-tree>
                      </div>

                      <div class="px-4 py-2 text-xs text-gray-400 border-t bg-gray-50 mb-4">
                        右键节点可添加或删除元件
                      </div>
                    </el-splitter-panel>
                    <el-splitter-panel
                      :min="200"
                      class="p-0 overflow-hidden bg-gray-50 flex flex-col"
                    >
                      <div class="flex items-center justify-between px-4 py-2 border-b bg-white">
                        <el-button-group>
                          <el-button
                            :type="currentTab.viewMode === 'edit' ? 'primary' : ''"
                            @click="currentTab.viewMode = 'edit'"
                          >
                            编辑
                          </el-button>
                          <el-button
                            :type="currentTab.viewMode === 'preview' ? 'primary' : ''"
                            @click="currentTab.viewMode = 'preview'"
                          >
                            预览XML
                          </el-button>
                          <el-button
                            :type="currentTab.viewMode === 'split' ? 'primary' : ''"
                            @click="currentTab.viewMode = 'split'"
                          >
                            分屏显示
                          </el-button>
                        </el-button-group>

                        <div class="flex gap-2">
                          <el-button type="success" @click="handleSave">保存</el-button>
                          <el-button type="primary" @click="handleDebug">调试</el-button>
                        </div>
                      </div>

                      <!-- 内容区域 -->
                      <div class="flex-1 flex overflow-hidden">
                        <!-- 左侧：编辑面板 -->
                        <div
                          v-show="currentTab.viewMode === 'edit' || currentTab.viewMode === 'split'"
                          class="overflow-auto p-6"
                          :class="{
                            'w-full': currentTab.viewMode === 'edit',
                            'w-1/2 border-r': currentTab.viewMode === 'split',
                          }"
                        >
                          <div v-if="currentTab.selectedNode">
                            <div class="flex items-center justify-between mb-6 border-b pb-4">
                              <h2 class="text-xl font-semibold flex items-center gap-3">
                                <span class="text-blue-600">⚙️</span>
                                {{ currentTab.selectedNode.label }} 属性
                              </h2>
                              <el-button type="danger" size="small" @click="deleteCurrentNode">
                                删除元件
                              </el-button>
                            </div>

                            <el-form
                              :model="currentTab.selectedNode.props_values"
                              label-position="top"
                              class="max-w-2xl space-y-5"
                            >
                              <el-form-item
                                v-for="prop in currentProps"
                                :key="prop.field + (prop.prefix || '') + prop.label"
                                :label="prop.label"
                                :required="prop.is_required === '1'"
                                :tooltip="prop.desc"
                              >
                                <!-- grouped 类型（httpProp、mysqlProp 等） -->
                                <!--                                <template v-if="prop.prefix && prop.field.endsWith('Prop') && prop.type !=='table'">-->
                                <template v-if="prop.__isGrouped">
                                  <el-input
                                    v-if="prop.type === 'input' || !prop.type"
                                    :model-value="getGroupedValue(prop.field, prop.prefix!)"
                                    @update:model-value="updateGroupedProp(prop, $event)"
                                    clearable
                                  />
                                  <GeneralCode
                                    v-else-if="prop.type === 'code'"
                                    :model-value="getGroupedValue(prop.field, prop.prefix!)"
                                    @update:model-value="updateGroupedProp(prop, $event)"
                                    style="height: 120px"
                                  />
                                  <!-- 其他子类型可继续扩展 -->
                                  <el-select
                                    v-else-if="prop.type === 'selectenv'"
                                    :model-value="getGroupedValue(prop.field, prop.prefix!)"
                                    @update:model-value="updateGroupedProp(prop, $event)"
                                    placeholder="请选择"
                                  >
                                    <el-option
                                      v-for="env in envList"
                                      :key="env.env_name"
                                      :label="env.env_name"
                                      :value="env.env_url"
                                    />
                                  </el-select>

                                  <div
                                    class="w-full space-y-4"
                                    v-else-if="prop.type === 'selectinterface'"
                                  >
                                    <!-- 项目 -->
                                    <el-select
                                      :model-value="getGroupedValue(prop.field, 'api_project')"
                                      @update:model-value="
                                        (val: any) => {
                                          updateGroupedProp(prop, val, 'api_project')
                                          // handleSwitchProject(val)
                                        }
                                      "
                                      @visible-change="
                                        (visible: any) => {
                                          if (!visible) {
                                            const val = getGroupedValue(prop.field, 'api_project')
                                            handleSwitchProject(val)
                                          }
                                        }
                                      "
                                      placeholder="请选择项目"
                                    >
                                      <el-option
                                        v-for="api_project in project_data"
                                        :key="api_project.project_key"
                                        :label="api_project.project_name"
                                        :value="api_project.project_key"
                                      />
                                    </el-select>

                                    <!-- 分支 -->
                                    <el-select
                                      :model-value="getGroupedValue(prop.field, 'api_branch')"
                                      @update:model-value="
                                        (val: any) => {
                                          updateGroupedProp(prop, val, 'api_branch')
                                          // handleSwitchBranch(val)
                                        }
                                      "
                                      @visible-change="
                                        (visible: any) => {
                                          if (!visible) {
                                            const val = getGroupedValue(prop.field, 'api_branch')
                                            handleSwitchBranch(val)
                                          }
                                        }
                                      "
                                      placeholder="请选择分支"
                                    >
                                      <el-option
                                        v-for="api_branch in branch_data"
                                        :key="api_branch.branch_key"
                                        :label="api_branch.branch_name"
                                        :value="api_branch.branch_key"
                                      />
                                    </el-select>

                                    <!-- 接口树 -->
                                    <el-tree-select
                                      :data="apisData"
                                      :render-after-expand="false"
                                      :props="{
                                        label: 'label',
                                        value: 'doc_operationId',
                                        children: 'children',
                                      }"
                                      :model-value="getGroupedValue(prop.field, prop.prefix!)"
                                      @update:model-value="updateGroupedProp(prop, $event)"
                                    />
                                  </div>
                                </template>
                                <template v-else>
                                  <el-input
                                    v-if="prop.type === 'input'"
                                    v-model="currentTab.selectedNode.props_values[prop.field]"
                                    :placeholder="prop.desc"
                                    clearable
                                  />

                                  <el-select
                                    v-else-if="prop.type === 'select'"
                                    v-model="currentTab.selectedNode.props_values[prop.field]"
                                    placeholder="请选择"
                                  >
                                    <el-option
                                      v-for="(label, value) in parseOptions(prop.options)"
                                      :key="value"
                                      :label="label"
                                      :value="value"
                                    />
                                  </el-select>

                                  <el-radio-group
                                    v-else-if="prop.type === 'radio'"
                                    v-model="currentTab.selectedNode.props_values[prop.field]"
                                  >
                                    <el-radio label="True">是</el-radio>
                                    <el-radio label="False">否</el-radio>
                                  </el-radio-group>

                                  <GeneralCode
                                    v-else-if="prop.type === 'code'"
                                    v-model="currentTab.selectedNode.props_values[prop.field]"
                                    style="height: 120px"
                                  />
                                  <div
                                    v-else-if="prop.type === 'table'"
                                    class="border border-dashed border-gray-300 rounded-xl p-4 bg-white"
                                  >
                                    <el-button
                                      type="primary"
                                      plain
                                      size="small"
                                      @click="addTableRow(prop.field)"
                                    >
                                      + 添加一行
                                    </el-button>
                                    <div
                                      v-for="(row, i) in currentTab.selectedNode.props_values[
                                        prop.field
                                      ] || []"
                                      :key="i"
                                      class="flex gap-3 mt-3"
                                    >
                                      <el-input v-model="row.key" placeholder="键" class="flex-1" />
                                      <el-input
                                        v-model="row.value"
                                        placeholder="值"
                                        class="flex-1"
                                      />
                                      <el-button
                                        type="danger"
                                        size="small"
                                        @click="removeTableRow(prop.field, i)"
                                        >删除</el-button
                                      >
                                    </div>
                                  </div>
                                  <el-input
                                    v-else
                                    v-model="currentTab.selectedNode.props_values[prop.field]"
                                  />
                                </template>
                              </el-form-item>
                            </el-form>

                            <div
                              v-if="currentProps.length === 0"
                              class="text-gray-400 py-12 text-center"
                            >
                              该元件没有可配置属性
                            </div>
                          </div>

                          <div v-else class="flex items-center justify-center h-full text-gray-400">
                            <div class="text-center">
                              <div class="text-6xl mb-4 opacity-60">📋</div>
                              <p class="text-lg">请选择左侧树中的元件</p>
                              <p class="text-sm mt-2">右键节点 → 添加子元件</p>
                            </div>
                          </div>
                        </div>

                        <!-- 右侧：XML 预览 -->
                        <div
                          v-show="
                            currentTab.viewMode === 'preview' || currentTab.viewMode === 'split'
                          "
                          class="bg-white"
                          :class="{ 'w-1/2 border-l': currentTab.viewMode === 'split' }"
                        >
                          <GeneralCode
                            v-model="currentTab.xmlPreview"
                            language="xml"
                            readonly
                            class="h-full w-full"
                          />
                        </div>
                      </div>
                    </el-splitter-panel>
                  </el-splitter>
                </div>

                <!-- 空状态 -->
                <div v-else class="h-full flex items-center justify-center bg-gray-50">
                  <div class="flex gap-8">
                    <el-card class="s-card cursor-pointer" @click="createCase"
                      >新增接口测试用例</el-card
                    >
                  </div>
                </div>
              </div>
            </div>
          </el-splitter-panel>
        </el-splitter>
      </div>

      <div v-else-if="currentPage === 'table'">
        <div class="table_toolbar">
          <el-input v-model="searchKeyword" placeholder="输入名称" style="width: 220px" clearable />
          <div class="table_actions">
            <el-button type="primary" @click="handleSendTask">下发任务</el-button>
          </div>
        </div>
        <el-table
          :data="filteredTableData"
          style="width: 100%"
          row-key="case_key"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          default-expand-all
          border
          ref="tableRef"
        >
          <!-- 自定义列，根据你的业务需求调整 -->
          <el-table-column type="selection" width="55" :selectable="selectable" />
          <el-table-column label="名称" width="300" prop="label">
            <template #default="{ row }">
              <span :style="{ paddingLeft: row.type === 'group' ? '0' : '20px' }">
                {{ row.label || row.case_name || '未命名' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="120">
            <template #default="{ row }">
              <el-tag :type="row.type === 'group' ? 'info' : 'success'">
                {{ row.type === 'group' ? '文件夹' : '用例' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="用例名称" prop="case_name" />
          <el-table-column label="文件夹名称" prop="case_folder_name" />
        </el-table>
      </div>
    </div>
  </div>

  <div
    v-if="contextMenu.visible"
    :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    class="fixed bg-white shadow-2xl border border-gray-200 rounded-xl py-1 w-52 z-50 text-sm overflow-hidden context-menu"
    @click.stop
  >
    <div
      class="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-2"
      @click="showAddDialog"
    >
      <el-icon><Plus /></el-icon> 添加子元件
    </div>
    <div class="border-t my-1"></div>
    <div
      class="px-4 py-3 hover:bg-red-50 text-red-600 cursor-pointer flex items-center gap-2"
      @click="deleteCurrentNodeFromContext"
    >
      <el-icon><Delete /></el-icon> 删除该元件
    </div>
  </div>

  <!-- 添加子元件弹窗（JMeter 分组风格） -->
  <el-dialog
    v-model="addDialogVisible"
    title="添加子元件"
    width="760px"
    :append-to-body="true"
    draggable
  >
    <!-- 核心：内部滚动容器 -->
    <div class="max-h-[480px] overflow-y-auto pr-1">
      <div v-for="group in groupedAllowedChildren" :key="group.group" class="mb-1">
        <div class="font-semibold text-blue-600 mb-3 px-1 uppercase tracking-wider">
          {{ group.group }}
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="comp in group.items"
            :key="comp.component_key"
            class="border border-gray-200 hover:border-blue-500 hover:shadow-md rounded-2xl p-5 cursor-pointer transition-all"
            @click="confirmAddChild(comp.component_key)"
          >
            <div class="font-medium text-base">组件名：{{ comp.component_name }}</div>
            <div class="text-xs text-gray-500 mt-2">组件类型：{{ comp.component_xml_tag }}</div>
            <div class="text-xs text-gray-500 mt-2">组件作用：{{ comp.component_desc }}</div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="addDialogVisible = false">取消</el-button>
    </template>
  </el-dialog>

  <general-dialog
    ref="CaseBranchGeneralDialogRef"
    :title="case_branch_dialog_title"
    :width="520"
    :confirmText="case_branch_dialog_button_text"
    btype="primary"
    @confirm="handleCaseBranchNew"
  >
    <!-- 模式切换 Tabs -->
    <el-tabs v-model="case_branch_create_type" class="branch-tabs mb-5">
      <el-tab-pane name="1" label="创建空分支">
        <div class="mode-desc text-gray-500 text-sm mb-4">
          从空白开始创建一个全新的分支，适用于测试使用。
        </div>
      </el-tab-pane>
      <el-tab-pane name="2" label="从现有分支复制">
        <div class="mode-desc text-gray-500 text-sm mb-4">
          基于已有分支创建副本，可用于特性开发或版本隔离。
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-form
      :model="case_branch_form"
      label-width="110px"
      :rules="case_branch_rules"
      ref="caseBranchFormRef"
      label-position="left"
    >
      <!-- 公共字段：分支名称 -->
      <el-form-item label="分支名称" prop="case_branch_name">
        <el-input
          v-model="case_branch_form.case_branch_name"
          placeholder="建议使用 feature/xxx、bugfix/xxx 等命名"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <!-- 仅复制分支时显示 -->
      <el-form-item v-if="case_branch_create_type === '2'" label="复制来源" required>
        <el-select
          v-model="case_source_branch"
          placeholder="请选择要复制的分支"
          filterable
          clearable
          class="w-full"
        >
          <el-option
            v-for="branch in case_branch_data"
            :key="branch.case_branch_key"
            :label="branch.case_branch_name"
            :value="branch.case_branch_key"
          >
            <span>{{ branch.case_branch_name }}</span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <!-- 底部提示（可选） -->
    <div v-if="case_branch_create_type === '2'" class="text-xs text-gray-500 mt-2">
      复制可能会花费较长的时间。
    </div>
  </general-dialog>

  <general-dialog
    ref="CaseFolderGeneralDialogRef"
    :title="case_folder_dialog_title"
    :width="520"
    :confirmText="case_folder_dialog_button_text"
    btype="primary"
    @confirm="handleCaseFolderNew"
  >
    <el-form
      :model="case_folder_form"
      label-width="110px"
      :rules="case_folder_rules"
      ref="caseFolderFormRef"
      label-position="left"
    >
      <!-- 公共字段：分支名称 -->
      <el-form-item label="目录名称" prop="case_folder_name">
        <el-input
          v-model="case_folder_form.case_folder_name"
          placeholder="建议使用功能模块来命名"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
    </el-form>
  </general-dialog>

  <general-dialog
    ref="DelCaseFolderDialogRef"
    title="删除目录"
    :width="400"
    confirmText="确定删除"
    btype="danger"
    @confirm="delCaseFolderConfirm"
  >
    <div class="delete-confirm">
      <el-icon size="48" color="#F56C6C"><Warning /></el-icon>
      <p>确定要删除目录吗？</p>
      <p class="sub-text">删除目录会同步删除目录下的所有内容，此操作不可恢复</p>
    </div>
  </general-dialog>

  <general-dialog
    ref="SendTaskDialogRef"
    title="下发任务"
    :width="400"
    confirmText="下发"
    btype="primary"
    @confirm="sendTaskConfirm"
  >
    <div style="margin-top: 10px">
      <el-form>
        <el-form-item label="任务名称">
          <el-input v-model="form.taskName" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="是否启用飞行监控">
          <el-switch v-model="form.isEnable" />
        </el-form-item>
      </el-form>
    </div>
  </general-dialog>

  <general-dialog
    ref="SelectCaseFolderDialogRef"
    title="选择目录"
    :width="400"
    confirmText="确定"
    btype="danger"
    @confirm="SelectCaseFolderConfirm"
  >
    <div class="delete-confirm">
      <el-select v-model="selectFolederValue" style="width:100%">
        <el-option
          v-for="item in folderDatas"
          :key="item.case_folder_key"
          :label="item.case_folder_name"
          :value="item.case_folder_key"
        />
      </el-select>
    </div>
  </general-dialog>
</template>

<script setup lang="ts">
import { onMounted, computed, h, ref, nextTick, onBeforeUnmount, watch } from 'vue'
import {
  ArrowRight,
  ArrowDown,
  Plus,
  Warning,
  MoreFilled,
  Edit,
  CopyDocument,
  Switch,
  Delete,
  FolderAdd,
  CaretRight,
  CaretBottom,
  Folder,
  Document,
  Memo,
  MostlyCloudy,
  FolderOpened,
  Files,
  Setting,
  Search,
} from '@element-plus/icons-vue'
import GeneralDialog from '@/components/GeneralDialog.vue'
import { ElForm, ElMessage, ElMessageBox, ElOption, ElSelect, ElTree } from 'element-plus'
import type { TreeInstance } from 'element-plus'
import { system_users } from '@/hooks/systems/users.ts'
import { jsonToTreeData, mapKeyToLabel } from '@/utils/util.ts'
import { Icon } from '@iconify/vue'

import GeneralCode from '@/components/GeneralCode.vue'
import { agent_reports } from '@/hooks/agent/agent.ts'
import { api_testcase_manager } from '@/hooks/ifaceauto/apitestcase.ts'
import { api_manager } from '@/hooks/ifaceauto/apimanager.ts'
import { v4 as uuidv4 } from 'uuid'
import GeneralNestTable from '@/components/GeneralNestTable.vue'

const page_switch = ref(true)
const tableRef = ref()

watch(page_switch, (newValue, oldValue) => {
  if (newValue) {
    currentPage.value = 'detail'
  } else {
    currentPage.value = 'table'
  }
})

const selectable = (row: any) => {
  return row.type === 'case'
}

const searchKeyword = ref('')

const filterTreeData = (nodes: any, keyword: any) => {
  if (!keyword) return nodes

  return nodes.reduce((acc: any, node: any) => {
    // 检查当前节点是否匹配
    const isMatch =
      node.label?.toLowerCase().includes(keyword.toLowerCase()) ||
      node.case_name?.toLowerCase().includes(keyword.toLowerCase())

    // 递归处理子节点
    let filteredChildren = []
    if (node.children && node.children.length) {
      filteredChildren = filterTreeData(node.children, keyword)
    }

    // 如果当前节点匹配，或者有匹配的子节点，则保留该节点
    if (isMatch || filteredChildren.length) {
      acc.push({
        ...node,
        children: filteredChildren,
      })
    }

    return acc
  }, [])
}

// 过滤后的数据
const filteredTableData = computed(() => {
  return filterTreeData(testcasesData.value, searchKeyword.value)
})

const SendTaskDialogRef = ref<InstanceType<typeof GeneralDialog>>()
const form = ref({
  taskName: '',
  isEnable: true,
})

const sendTaskConfirm = async () => {
  // if (!currentAgent.value) {
  //   ElMessage.warning('请选择执行节点')
  //   return
  const selected = tableRef.value.getSelectionRows()
  const res = await SendCaseTask({
    task_name: form.value.taskName,
    twins_flame: form.value.isEnable,
    task_cases: selected,
    agent_key: currentAgent.value,
  })

  if (res.msg === '任务下发成功') {
    ElMessage.success(res.msg)
  } else {
    ElMessage.error(res.msg)
  }
  SendTaskDialogRef.value?.close()
}

const handleSendTask = async () => {
  if (tableRef.value.getSelectionRows().length < 1) {
    ElMessage.warning('未检测到勾选用例')
    return
  }
  if (!currentAgent.value) {
    ElMessage.warning('请选择执行节点')
    return
  }
  SendTaskDialogRef.value?.open()

  // try {
  //   const selected = tableRef.value.getSelectionRows()
  //   console.log('手动获取勾选内容:', selected)
  //   const task_name = await ElMessageBox.prompt('请输入任务名称', '确认保存', {
  //     confirmButtonText: '确定保存',
  //     cancelButtonText: '取消',
  //     inputValue: '',
  //     inputPattern: /[\s\S]*/, // 正则校验（随便输）
  //     inputErrorMessage: '请输入内容', // 为空时报错
  //
  //     autofocus: false,
  //   })
  //   await SendCaseTask({
  //     task_name: task_name,
  //     task_cases: selected,
  //     agent_key: currentAgent.value.agent_key
  //   })
  // }catch (error) {
  //   console.log(error)
  // }
}

// 这里要拿一下节点的数据
const { fetchApiAgents } = agent_reports()

const getAgentStatus = (status: number) => {
  if (status === 0) return '失联'
  return '存活'
}

const getAgentStatusColor = (status: number) => {
  if (status === 0) return 'red'
  return 'green'
}

interface AgentItem {
  agent_key: string
  agent_name: string
  agent_status: number
  agent_running_tasks: string
  agent_max_tasks: string
  agent_cpu: string
  agent_memory: string
  agent_io: string
  created_at: string | Date
  updated_at: string | Date
}

const currentAgent = ref('')

const agentList = ref<AgentItem[]>([])

const fetchAgents = async () => {
  const res: { agents: AgentItem[] } = await fetchApiAgents({
    current_page: 1,
    current_count: 1000000,
  })
  agentList.value = res.agents
}

// 这里要拿一下用户的数据
const { fetchUsers } = system_users()

// 用户
interface UserItem {
  user_key: string
  nickname: string
  username: string
  email: string
  phone: string
  status: string
  dept_key: string
  dept: string
  role_key: string
  role: string
  created_at: string | Date
}

interface Users {
  total_count: number
  users: UserItem[]
}

const totalCount = ref(0)

const tableDatas = ref<UserItem[]>([])

const fecthUserData = async (page: number, size: number) => {
  const result: Users = await fetchUsers({
    i_type: 1,
    current_page: page,
    current_count: size,
  })
  totalCount.value = result.total_count
  tableDatas.value = result.users
}

// 页面切换方法
const goPage = async (page: string, data: any) => {
  currentPage.value = page
  if (data !== null && data !== undefined) {
    currentcaseProject.value = data
    await fetch_case_branchs()
    get_master_branch()
    await fetchAgents()
    await fetch_Projects()
    await fetchenvs()
    await fetch_Folders()
    componentDefs.value = await fetchApiComponents({})
    if (currentCaseBranch.value?.case_branch_key !== '0') {
      await fetch_testcases(
        currentcaseProject.value!.case_project_key,
        currentCaseBranch.value!.case_branch_key,
      )
    }
  }
}

const { fetchApiProjects, fetchApiBranchs, fetchApis, fetchEnvs } = api_manager()

// -- 拿项目之类的内容
interface ProjectItem {
  project_key: string
  project_name: string
  project_desc: string | ''
  user_key: string
}

const project_data = ref<ProjectItem[]>([])

const fetch_Projects = async () => {
  project_data.value = await fetchApiProjects({})
}

interface BranchItem {
  branch_key: string
  branch_name: string
  is_default: number
}

const branch_data = ref<BranchItem[]>([])

const fetch_Branchs = async (project_key: string) => {
  branch_data.value = await fetchApiBranchs({
    project_key: project_key,
  })
}

interface ApisItem {
  project_key: string
  branch_key: string
  folder_key: string
  doc_key: string
  doc_name: string
  doc_transfer_protocol: string
  doc_ip: string
  doc_port: string
  doc_path: string
  doc_method: string
  doc_operationId: string
  doc_req_content_type: string
  doc_req_params: any[]
  doc_req_required: any[]
  doc_res_status: string
  doc_res_content_type: string
  doc_res_params: any[]
  doc_res_required: any[]
  doc_order: number
  doc_desc: string
  doc_debug_json: string
  type: string
  label: string
}

interface ApisData {
  project_key: string
  branch_key: string
  folder_key: string
  folder_name: string
  folder_order: number
  type: string
  label: string
  children: ApisItem[]
}

type ApiTreeNode = ApisData | ApisItem

const apisData = ref<ApiTreeNode[]>([])

const fetch_apis = async (project_key: string, branch_key: string) => {
  const res = await fetchApis({
    project_key: project_key,
    branch_key: branch_key,
  })
  apisData.value = res.apis
}

const handleSwitchProject = async (project_key: string) => {
  if (!currentTab.value?.selectedNode) return
  await fetch_Branchs(project_key)
}

const handleSwitchBranch = async (branch_key: string) => {
  console.log(branch_key)
  if (!currentTab.value?.selectedNode) return
  // console.log(selectedNode.value)
  // const projectKey = getGroupedValue(selectedNode.value.props_values.httpProp, 'api_project')
  const projectKey = currentTab.value.selectedNode.props_values.httpProp.find(
    (item: any) => item.name === 'api_project',
  )
  console.log(projectKey)
  await fetch_apis(projectKey.value, branch_key)
}

// --

const {
  addApiCaseProject,
  fetchApiCaseProjects,
  editApiCaseProject,
  delApiCaseProject,
  addApiCaseBranch,
  fetchApiCaseBranchs,
  addApiCaseFolder,
  editApiCaseFolder,
  delApiCaseFolder,
  fetchApiCaseFolders,
  fetchApiTestCases,
  manageApiTestCase,
  DebugApiTestCase,
  SendCaseTask,
  fetchApiComponents,
  delApiTestCase,
} = api_testcase_manager()

// 项目的相关操作
// 首页的项目管理
const currentPage = ref('list')
// 定义当前选中的项目，当切换的时候更改这个
const currentcaseProject = ref<CaseProjectItem>()

const case_projectFormRef = ref<InstanceType<typeof ElForm> | null>(null)
const DelCaseProjectDialogRef = ref<InstanceType<typeof GeneralDialog>>()
const CaseProjectGeneralDialogRef = ref<InstanceType<typeof GeneralDialog>>()

const case_project_dialog_title = ref('')
const case_project_dialog_button_text = ref('')
const case_project_dialog_action = ref('')

interface CaseProjectItem {
  case_project_key: string
  case_project_name: string
  case_project_desc: string | ''
  user_key: string
}

// 查询
const fetch_case_projects = async () => {
  case_project_data.value = await fetchApiCaseProjects({})
}

// 重置编辑框的内容
const handleProjectReset = () => {
  Object.assign(case_project_form.value, {
    case_project_name: '',
    case_project_desc: '',
  })
  // 可选：手动清除校验提示
  case_projectFormRef.value?.clearValidate()
}

//新增和编辑使用
const case_project_form = ref({
  case_project_name: '',
  case_project_desc: '',
})

const case_project_rules = {
  case_project_name: [{ required: true, message: '请输入项目名称', trigger: 'submit' }],
}

const case_project_data = ref<CaseProjectItem[]>([])

const handleAddCaseProject = () => {
  handleProjectReset()
  case_project_dialog_title.value = '创建用例项目'
  case_project_dialog_button_text.value = '新增'
  case_project_dialog_action.value = '新增'
  CaseProjectGeneralDialogRef.value?.open()
}

const handleCaseProjectEdit = (item: any) => {
  handleProjectReset()
  Object.assign(case_project_form.value, {
    case_project_name: item.case_project_name,
    case_project_desc: item.case_project_desc,
  })
  case_project_dialog_title.value = '编辑项目'
  case_project_dialog_button_text.value = '编辑'
  case_project_dialog_action.value = '编辑'
  CaseProjectGeneralDialogRef.value?.open(item)
}

// 新增项目
const handleCaseProjectNew = async (data: any) => {
  case_projectFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (case_project_dialog_action.value === '新增') {
        const res = await addApiCaseProject({
          case_project_name: case_project_form.value.case_project_name,
          case_project_desc: case_project_form.value.case_project_name,
        })
        if (res.msg === '新增成功') {
          ElMessage.success(res.msg)
          await fetch_case_projects()
        } else {
          ElMessage.error(res.msg)
        }
        CaseProjectGeneralDialogRef.value?.close()
      } else {
        const res = await editApiCaseProject({
          case_project_key: data.case_project_key,
          case_project_name: case_project_form.value.case_project_name,
          case_project_desc: case_project_form.value.case_project_desc,
        })
        if (res.msg === '编辑成功') {
          ElMessage.success(res.msg)
          await fetch_case_projects()
        } else {
          ElMessage.error(res.msg)
        }
        CaseProjectGeneralDialogRef.value?.close()
      }
    }
  })
}

// 删除项目
const handleCaseProjectDelete = (item: any) => {
  DelCaseProjectDialogRef.value?.open(item)
}

const delCaseProjectConfirm = async (data: any) => {
  const res = await delApiCaseProject({
    case_project_key: data.case_project_key,
  })
  if (res.msg === '删除成功') {
    ElMessage.success(res.msg)
    await fetch_case_projects()
  } else {
    ElMessage.error(res.msg)
  }
  DelCaseProjectDialogRef.value?.close()
}

// 处理项目切换
const handleProjectSwitch = async (project: any) => {
  if (project === 'manage') {
    goPage('list', '')
    return
  }
  currentcaseProject.value = project
  await fetch_case_branchs()
  get_master_branch()
  if (currentCaseBranch.value?.case_branch_key !== '0') {
    await fetch_testcases(
      currentcaseProject.value!.case_project_key,
      currentCaseBranch.value!.case_branch_key,
    )
  }
  ElMessage.success(`已切换到项目`)
}
// --------------------------------------------------------
// 详情页分支相关操作

interface CaseBranchItem {
  case_branch_key: string
  case_branch_name: string
  is_default: number
}
const case_branch_data = ref<CaseBranchItem[]>([])
const caseBranchFormRef = ref<InstanceType<typeof ElForm> | null>(null)
const CaseBranchGeneralDialogRef = ref<InstanceType<typeof GeneralDialog>>()

const case_branch_create_type = ref('1')

const case_branch_dialog_title = ref('')
const case_branch_dialog_button_text = ref('')

// 确定来源的字段
const case_source_branch = ref('')

const case_branch_form = ref({
  case_branch_name: '',
})

const case_branch_rules = {
  case_branch_name: [{ required: true, message: '请输入分支名称', trigger: 'submit' }],
}

const handleBranchReset = () => {
  Object.assign(case_branch_form.value, {
    case_branch_name: '',
  })
  case_source_branch.value = ''
  caseBranchFormRef.value?.clearValidate()
}

const fetch_case_branchs = async () => {
  case_branch_data.value = await fetchApiCaseBranchs({
    case_project_key: currentcaseProject.value!.case_project_key,
  })
}

// 定义当前的分支
const currentCaseBranch = ref<CaseBranchItem>()

const get_master_branch = () => {
  currentCaseBranch.value = case_branch_data.value.find((branch) => branch.is_default === 1) || {
    case_branch_key: '0',
    case_branch_name: '暂无分支',
    is_default: 0,
  }
}

const handleCaseBranchSwitch = async (branch: any) => {
  if (branch === 'create') {
    handleBranchReset()
    case_branch_dialog_title.value = '创建分支'
    case_branch_dialog_button_text.value = '创建'
    CaseBranchGeneralDialogRef.value?.open()
    return
  } else if (branch === 'manage') {
    ElMessage.info('后续在开发针对分支维护方面的开发')
    return
  }
  currentCaseBranch.value = branch
  await fetch_apis(
    currentcaseProject.value!.case_project_key,
    currentCaseBranch.value!.case_branch_key,
  )
  ElMessage.success(`已切换到${branch.branch_name}分支`)
  // 这里可以加载对应项目的数据
}

const handleCaseBranchNew = async (data: any) => {
  caseBranchFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      const res = await addApiCaseBranch({
        case_project_key: currentcaseProject.value!.case_project_key,
        case_branch_name: case_branch_form.value.case_branch_name,
        case_branch_source: case_source_branch.value,
      })
      if (res.msg === '新增成功' || res.msg === '复制分支成功') {
        ElMessage.success(res.msg)
        CaseBranchGeneralDialogRef.value?.close()
        await fetch_case_branchs()
      } else {
        ElMessage.error(res.msg)
        CaseBranchGeneralDialogRef.value?.close()
      }
    }
  })
}

// --------------------------------------------------------

// 详情页目录的相关方法

interface TestCasesItem {
  case_project_key: string
  case_branch_key: string
  case_folder_key: string
  case_key: string
  case_name: string
  case_content: string
  case_struct_data?: string
  type: string
  label: string
}

interface TestCasesData {
  case_project_key: string
  case_branch_key: string
  case_folder_key: string
  case_folder_name: string
  case_folder_order: number
  type: string
  label: string
  children: TestCasesItem[]
}

type TestCaseTreeNode = TestCasesItem | TestCasesData

const testcasesData = ref<TestCaseTreeNode[]>([])

const fetch_testcases = async (project_key: string, branch_key: string) => {
  const res = await fetchApiTestCases({
    case_project_key: project_key,
    case_branch_key: branch_key,
  })
  testcasesData.value = res.testcases
}

const defaultProps = {
  children: 'children',
  label: 'label',
}

const keyword = ref('')

const filteredTreeData = computed(() => {
  if (!keyword.value) return testcasesData.value

  const filterTree = (nodes: any[]): any[] => {
    return nodes.filter((node) => {
      // 如果节点名称包含关键词
      console.log(keyword.value)
      const matchName = node.label.includes(keyword.value)

      // 如果有子节点，递归过滤子节点
      if (node.children) {
        const filteredChildren = filterTree(node.children)
        if (filteredChildren.length > 0) {
          node.children = filteredChildren
          return true
        }
      }
      return matchName
    })
  }
  return filterTree(JSON.parse(JSON.stringify(testcasesData.value)))
})

const CaseFolderGeneralDialogRef = ref<InstanceType<typeof GeneralDialog>>()
const case_folder_form = ref({
  case_folder_name: '',
})
const case_folder_rules = {
  case_folder_name: [{ required: true, message: '请输入目录名称', trigger: 'submit' }],
}

const caseFolderFormRef = ref<InstanceType<typeof ElForm> | null>(null)

const case_folder_dialog_title = ref('')
const case_folder_dialog_button_text = ref('')
const case_folder_dialog_action = ref('')

const DelCaseFolderDialogRef = ref<InstanceType<typeof GeneralDialog>>()

interface FolderItem {
  case_folder_key: string
  case_folder_name: string

}

const folderDatas = ref<FolderItem[]>([])

const fetch_Folders = async () => {
  folderDatas.value = await fetchApiCaseFolders({
    case_project_key: currentcaseProject.value!.case_project_key,
    case_branch_key: currentCaseBranch.value?.case_branch_key,
  })
}

const handleDropdownCommand = (command: string) => {
  if (currentCaseBranch.value?.case_branch_key === '0') {
    ElMessage.warning('没有建立分支时，不允许创建接口和分组')
    return
  }
  if (command === 'addApi') {
    createCase('', '')
  } else if (command === 'addGroup') {
    createGroup()
  }
}

// 添加标签页
const addtab = () => {
  createCase('', '')
}

// 关闭Tab
const removeTab = (key: string) => {
  const idx = tabs.value.findIndex((t) => t.case_key === key)
  if (idx !== -1) {
    tabs.value.splice(idx, 1)
    if (tabs.value.length > 0) {
      const newIndex = Math.max(0, idx - 1)
      const target = tabs.value[newIndex]
      if (target) {
        activeTab.value = target.case_key
      }
      // activeTab.value = tabs.value[Math.max(0, idx - 1)].case_key
    } else {
      activeTab.value = ''
    }
  }
}

// 处理树节点点击（用于打开接口）
const handleTreeItemClick = (data: any) => {
  if (data.type === 'case') {
    console.log(data)
    openCase(data)
  }
}

// Tab标题渲染
const renderTabLabel = (tab: any) => {
  return h('span', { class: 'flex items-center gap-1' }, [h('span', {}, tab.label)])
}

const createGroup = () => {
  Object.assign(case_folder_form.value, {
    folder_name: '',
  })
  case_folder_dialog_title.value = '新增目录'
  case_folder_dialog_button_text.value = '新增'
  case_folder_dialog_action.value = '新增'
  CaseFolderGeneralDialogRef.value?.open()
}

const editGroup = (data: any) => {
  Object.assign(case_folder_form.value, {
    folder_name: '',
  })
  Object.assign(case_folder_form.value, {
    folder_name: data.folder_name,
  })
  case_folder_dialog_title.value = '编辑目录'
  case_folder_dialog_button_text.value = '编辑'
  case_folder_dialog_action.value = '编辑'
  CaseFolderGeneralDialogRef.value?.open(data)
}

const deleteGroup = (data: any) => {
  DelCaseFolderDialogRef.value?.open(data)
}

const delCaseFolderConfirm = async (data: any) => {
  const res = await delApiCaseFolder({
    case_folder_key: data.case_folder_key,
  })

  if (res.msg === '删除成功') {
    ElMessage.success(res.msg)
    DelCaseFolderDialogRef.value?.close()
    testcasesData.value.forEach((item, index) => {
      if (item.type === 'group') {
        const folder = item as TestCasesData
        if (
          folder.case_folder_key === data.case_folder_key &&
          folder.case_project_key === data.case_project_key &&
          folder.case_branch_key === data.case_branch_key
        ) {
          testcasesData.value.splice(index, 1)
        }
      }
    })
  } else {
    ElMessage.error(res.msg)
    DelCaseFolderDialogRef.value?.close()
  }
}

const handleCaseFolderNew = async (data: any) => {
  caseFolderFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (case_folder_dialog_action.value === '新增') {
        const new_folder_key = uuidv4()
        const res = await addApiCaseFolder({
          case_project_key: currentcaseProject.value!.case_project_key,
          case_branch_key: currentCaseBranch.value!.case_branch_key,
          case_folder_key: new_folder_key,
          case_folder_name: case_folder_form.value.case_folder_name,
        })
        if (res.msg === '新增成功') {
          ElMessage.success(res.msg)
          CaseFolderGeneralDialogRef.value?.close()
          testcasesData.value.push({
            case_project_key: currentcaseProject.value!.case_project_key,
            case_branch_key: currentCaseBranch.value!.case_branch_key,
            case_folder_key: new_folder_key,
            case_folder_name: case_folder_form.value.case_folder_name,
            case_folder_order: 1,
            type: 'group',
            label: case_folder_form.value.case_folder_name,
            children: [],
          })
        } else {
          ElMessage.error(res.msg)
          CaseFolderGeneralDialogRef.value?.close()
        }
      } else {
        const res = await editApiCaseFolder({
          case_folder_key: data.case_folder_key,
          case_folder_name: case_folder_form.value.case_folder_name,
        })
        if (res.msg === '编辑成功') {
          ElMessage.success(res.msg)
          CaseFolderGeneralDialogRef.value?.close()
          testcasesData.value.forEach((item) => {
            if (item.type === 'group') {
              const folder = item as TestCasesData
              if (
                folder.case_folder_key === data.case_folder_key &&
                folder.case_project_key === data.case_project_key &&
                folder.case_branch_key === data.case_branch_key
              ) {
                folder.case_folder_name = case_folder_form.value.case_folder_name
                folder.label = case_folder_form.value.case_folder_name
              }
            }
          })
        } else {
          ElMessage.error(res.msg)
        }
      }
    }
  })
}

// 左侧树命令处理
const handleNodeCommand = (command: string, nodeData: any) => {
  switch (command) {
    case 'rename_group':
      editGroup(nodeData)
      break
    case 'delete_group':
      deleteGroup(nodeData)
      break
    case 'add_api':
      createCase('group', nodeData.case_folder_key)
      break
    case 'rename_api':
      ElMessage.info('正在开发')
      break
    case 'copy_api':
      copy_case(nodeData)
      break
    case 'move_api':
      move_case(nodeData)
      break
    case 'delete_api':
      delete_case(nodeData)
      // ElMessage.info('正在开发')
      // handleDelete(nodeData)
      break
  }
}

// --未完待续

interface EnvItem {
  env_key?: string
  env_name: string
  env_icon: string // 首字母
  env_url: string // 背景色类
  env_color: string // 背景色类
}

const envList = ref<EnvItem[]>([])

const fetchenvs = async () => {
  const res: { envs: EnvItem[] } = await fetchEnvs({})
  envList.value = res.envs
}

// const handleDelete = async (nodelData: any) => {
//   // console.log(nodelData)
//   // const res = await delApi({
//   //   doc_key: nodelData.doc_key
//   // })
//   // if (res.msg === '删除成功') {
//   //   ElMessage.success(res.msg)
//   //   removeTab(nodelData.doc_key)
//   //   testcasesData.value = removeNode(testcasesData.value, nodelData)
//   //
//   // }else {
//   //   ElMessage.error(res.msg)
//   // }
// }
//
// const removeNode = (data: any, nodelData: any) => {
//   return data.filter((node: any) => {
//     if (node.type === 'api' && node.doc_key === nodelData.doc_key) {
//       return false
//     }
//     if (node.children && node.children.length > 0) {
//       node.children = removeNode(node.children, nodelData)
//     }
//     return true
//   })
// }

// Tabs

interface CaseTab {
  case_project_key: string
  case_branch_key: string
  case_folder_key: string
  case_key: string
  case_name: string
  case_content: string
  type: string
  label: string
  viewMode: string
  // ✅ 每个 tab 独立
  treeData: TreeNode[]
  selectedNode: TreeNode | null
  xmlPreview: string
}

const tabs = ref<CaseTab[]>([])
const activeTab = ref('')

const currentTab = computed(() => tabs.value.find((t) => t.case_key === activeTab.value))
// const currentCase = computed(() => tabs.value.find((t) => t.case_key === activeTab.value))

// 编辑器
const mode = ref('design')

// 树
const expandedKeys = ref<string[]>([])

// 新建用例（空状态点击）
const createCase = (api_add_type: string, case_folder_key: string = '') => {
  const new_api_key = uuidv4()
  const case_init_data = {
    case_project_key: currentcaseProject.value!.case_project_key,
    case_branch_key: currentCaseBranch.value!.case_branch_key,
    case_folder_key: case_folder_key,
    case_key: new_api_key,
    case_name: '新建用例',
    case_content: '',
    viewMode: 'edit',
    type: 'case',
    label: '新建用例',
  }
  if (api_add_type === 'group') {
    testcasesData.value.forEach((item) => {
      if (item.type === 'group') {
        const case_folder = item as TestCasesData
        if (
          case_folder.case_folder_key === case_folder_key &&
          case_folder.case_project_key === currentcaseProject.value!.case_project_key &&
          case_folder.case_branch_key === currentCaseBranch.value!.case_branch_key
        ) {
          case_folder.children.push(case_init_data)
        }
      }
    })
    expandedKeys.value.push(case_folder_key)
    openCase(case_init_data)
  } else {
    testcasesData.value.push(case_init_data)
    openCase(case_init_data)
  }
}

const openCase = (data: any) => {
  const existing = tabs.value.find((t) => t.case_key === data.case_key)
  if (existing) {
    activeTab.value = existing.case_key
    return
  }
  const tab: CaseTab = {
    case_project_key: currentcaseProject.value!.case_project_key,
    case_branch_key: currentCaseBranch.value!.case_branch_key,
    case_folder_key: data.case_folder_key,
    case_key: data.case_key,
    case_name: data.case_name,
    case_content: data.case_content,
    type: data.type || 'case',
    label: data.case_name,
    viewMode: 'edit',
    treeData: [],
    selectedNode: null,
    xmlPreview: '',
  }
  if (data.case_struct_data && data.case_struct_data.length > 2) {
    const parsed = JSON.parse(data.case_struct_data)
    tab.treeData = parsed
    tab.selectedNode = parsed[0]
  } else {
    tab.treeData = initDefaultTree() // 改成返回数据函数
    tab.selectedNode = tab.treeData[0] || null
  }
  tabs.value.push(tab)
  activeTab.value = tab.case_key
  // tabs.value.push(data)
  // activeTab.value = data.case_key
  // if (data.case_struct_data && data.case_struct_data.length > 2) {
  //   const treeDataParsed = JSON.parse(data.case_struct_data)
  //   treeData.value = treeDataParsed
  //   nextTick(() => {
  //     selectedNode.value = treeDataParsed[0]
  //   })
  // } else {
  //   initDefaultTree()
  // }
  // document.addEventListener('click', hideContextMenu)
}

// const safeParse = (val: any) => {
//   if (!val) return []
//   if (typeof val === 'string') {
//     try {
//       return JSON.parse(val)
//     } catch {
//       return []
//     }
//   }
//   return val
// }

interface ComponentItem {
  component_key: string
  component_name: string
  component_type: string
  component_category: string
  component_xml_tag: string
  is_container: number
  parent_keys: string[]
  allow_child_categories: string[]
  props: ComponentProp[]
  component_order: number
  component_desc: string
}

interface ComponentProp {
  label: string
  field: string
  prefix?: string
  is_required: string
  type:
    | 'input'
    | 'select'
    | 'radio'
    | 'table'
    | 'code'
    | 'selectenv'
    | 'selectinterface'
    | 'grouped'
  desc: string
  xml_attr: boolean
  options?: Record<string, string>
  children?: ComponentProp[]
}

interface TreeNode {
  id: string
  component_key: string
  label: string
  component_category: string
  children: TreeNode[]
  props_values: Record<string, any>
  component_def?: ComponentItem | null
}

// 视图模式：edit / preview / split
// const viewMode = ref('edit')

// XML 预览内容
// const xmlPreview = ref('')

let xmlUpdateTimer: number | null = null

// ====================== 状态 ======================
const componentDefs = ref<ComponentItem[]>([])
// const treeData = ref<TreeNode[]>([])
// const selectedNode = ref<TreeNode | null>(null)
const treeRef = ref<TreeInstance | null>(null)

const expandejmeterKeys = ref<string[]>([])

const contextMenu = ref({ visible: false, x: 0, y: 0, node: null as TreeNode | null })
const addDialogVisible = ref(false)
const currentParentNode = ref<TreeNode | null>(null)

// let nodeIdCounter = 1000

// ====================== 分屏工具函数 ======================

const currentProps = computed(() => {
  // 1. 没有选中节点 → 直接空
  if (!currentTab.value?.selectedNode) return []

  // 2. 找到当前节点对应的【组件定义】(就是你 JSON 里的 mysql读取器 配置)
  const compDef = componentDefs.value.find(
    (c) => c.component_key === currentTab.value?.selectedNode?.component_key,
  )
  if (!compDef || !compDef.props) return []

  // 3. 扁平化：把 grouped 的 children 展开，其他保持原样
  const list = []
  for (const prop of compDef.props) {
    // ✅ 只有 grouped 带 children 才展开
    if (prop.type === 'grouped' && prop.children?.length) {
      prop.children.forEach((child) => {
        list.push({
          ...child,
          field: prop.field, // 继承父级 field：mysqlProp / httpProp
          __isGrouped: true,
        })
      })
    } else {
      // ✅ 普通组件直接保留（input/select/table/radio 等都不变）
      list.push({ ...prop, __isGrouped: false })
    }
  }
  console.log('进来')
  console.log(list)
  return list
})

const updateGroupedProp = (prop: ComponentProp, value: any, customPrefix?: string) => {
  console.log(prop)
  if (!currentTab.value?.selectedNode) return
  const field = prop.field
  const nameKey = customPrefix ?? prop.prefix! // "ip", "sql", "h:env" 等

  if (!currentTab.value.selectedNode.props_values[field]) {
    currentTab.value.selectedNode.props_values[field] = []
  }
  const arr = currentTab.value.selectedNode.props_values[field]
  let item = arr.find((i: any) => i.name === nameKey)
  if (item) {
    item.value = value
  } else {
    arr.push({ name: nameKey, value })
  }
}

const getGroupedValue = (field: string, prefix: string): string => {
  const arr = currentTab.value?.selectedNode?.props_values?.[field]
  if (!Array.isArray(arr)) return ''
  const item = arr.find((i: any) => i.name === prefix)
  return item?.value ?? ''
}

const generateXml = (nodes: TreeNode[], indent: number = 0): string => {
  let xml = ''
  const pad = ' '.repeat(indent)

  for (const node of nodes) {
    const def = getComponentByKey(node.component_key)
    if (!def) continue

    const attrs: string[] = []
    const normalProps: ComponentProp[] = [] // 普通字段（直接 <xxx>value</xxx>）
    const groupedProps = new Map<string, ComponentProp[]>() // key = field (如 mysqlProp), value = 该组的所有 prop 定义

    // 分类 props
    def.props.forEach((prop) => {
      const val = node.props_values[prop.field]
      if (val === undefined || val === null) return

      if (prop.xml_attr) {
        attrs.push(`${prop.field}="${val}"`)
      } else if (prop.type === 'grouped' && prop.field.endsWith('Prop')) {
        // 自动识别所有 *Prop 或 type=grouped
        if (!groupedProps.has(prop.field)) groupedProps.set(prop.field, [])
        groupedProps.get(prop.field)!.push(prop)
      } else {
        normalProps.push(prop)
      }
    })

    const attrStr = attrs.length ? ' ' + attrs.join(' ') : ''
    xml += `${pad}<${def.component_xml_tag}${attrStr}>\n`

    // 1. 输出普通字段（table、普通 input、code 等）
    normalProps.forEach((prop) => {
      const value = node.props_values[prop.field]
      if (value === undefined || value === null) return

      if (prop.type === 'table') {
        if (Array.isArray(value)) {
          value.forEach((row) => {
            if (!row.key) return
            const fullName = `${prop.prefix || ''}${row.key}`
            xml += `${pad}  <${prop.field} name="${fullName}">${row.value || ''}</${prop.field}>\n`
          })
        }
      } else if (prop.type === 'code') {
        xml += `${pad}  <${prop.field} name="${prop.prefix || ''}">\n${value || ''}\n${pad}  </${prop.field}>\n`
      } else {
        xml += `${pad}  <${prop.field}>${value || ''}</${prop.field}>\n`
      }
    })

    // 2. 输出所有 grouped Prop（httpProp、mysqlProp、redisProp... 全部自动处理）
    groupedProps.forEach((propsInGroup, groupField) => {
      const groupValue = node.props_values[groupField]
      if (!Array.isArray(groupValue)) return

      groupValue.forEach((item) => {
        if (!item.name || item.value === undefined) return
        const propDef = propsInGroup.find(
          (p) => p.prefix === item.name.split(':')[1] || p.prefix === item.name,
        )

        if (propDef?.type === 'code') {
          xml += `${pad}  <${groupField} name="${item.name}">\n${item.value || ''}\n${pad}  </${groupField}>\n`
        } else {
          xml += `${pad}  <${groupField} name="${item.name}">${item.value || ''}</${groupField}>\n`
        }
      })
    })

    // 3. 递归子节点
    if (node.children?.length) {
      xml += generateXml(node.children, indent + 1)
    }

    xml += `${pad}</${def.component_xml_tag}>\n`
  }
  return xml
}

// 防抖更新XML（性能优化：300ms内只更新一次，避免卡顿）
const updateXml = () => {
  if (!currentTab.value) return

  if (xmlUpdateTimer) {
    clearTimeout(xmlUpdateTimer)
  }
  xmlUpdateTimer = window.setTimeout(() => {
    currentTab.value!.xmlPreview = generateXml(currentTab.value!.treeData)
    xmlUpdateTimer = null
  }, 300)
}

// 监听treeData变化，自动更新XML
watch(
  () => currentTab.value?.treeData,
  () => {
    if (!currentTab.value) return
    updateXml()
  },
  { deep: true, immediate: true },
)

// 监听selectedNode变化，也更新XML（编辑时实时生效）
watch(
  () => currentTab.value?.selectedNode?.props_values,
  () => {
    if (!currentTab.value) return
    updateXml()
  },
  { deep: true },
)

// ====================== 核心工具函数 ======================
const getComponentByKey = (key: string) => componentDefs.value.find((c) => c.component_key === key)

const parseOptions = (options: any) => {
  if (!options) return {}
  if (typeof options === 'object') return options
  try {
    return JSON.parse(options)
  } catch {
    return {}
  }
}

// ====================== 动态属性面板 ======================
// const currentProps = computed(() => {
//   if (!selectedNode.value) return []
//   const def = getComponentByKey(selectedNode.value.component_key)
//   if (!def?.props || !Array.isArray(def.props)) return []
//   return def.props
// })

// ====================== 树操作 ======================
const treeProps = { label: 'label', children: 'children' }

const initDefaultTree = (): TreeNode[] => {
  const testPlanDef = componentDefs.value.find((item) => item.component_type === 'root')
  if (!testPlanDef) return []

  const testPlan: TreeNode = {
    id: `node-${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    component_key: testPlanDef.component_key,
    label: testPlanDef.component_name,
    component_category: testPlanDef.component_category,
    children: [],
    props_values: { name: '我的测试计划' },
  }
  //
  // treeData.value = [testPlan]
  // nextTick(() => {
  //   selectedNode.value = testPlan
  // })
  return [testPlan]
}

const createNewNode = (compKey: string): TreeNode => {
  const def = getComponentByKey(compKey)!
  const newNode: TreeNode = {
    id: `node-${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    component_key: compKey,
    label: def.component_name,
    component_category: def.component_category,
    children: [],
    props_values: {},
  }

  if (Array.isArray(def.props)) {
    def.props.forEach((prop) => {
      const key = prop.field
      if (prop.type === 'table') {
        newNode.props_values[key] = [{ key: '', value: '' }]
      } else {
        newNode.props_values[key] = ''
      }
    })
  }
  return newNode
}

const confirmAddChild = (compKey: string) => {
  if (!currentParentNode.value) return
  const newNode = createNewNode(compKey)
  currentParentNode.value.children.push(newNode)
  nextTick(() => {
    expandejmeterKeys.value.push(currentParentNode.value!.id)
    treeRef.value?.setCurrentKey(newNode.id)
    currentTab.value!.selectedNode = newNode
  })
  // selectedNode.value = newNode
  addDialogVisible.value = false
  // ElMessage.success(`已添加「${getComponentByKey(compKey)?.component_name}」`)
}

// ====================== 右键 & 删除 ======================
const handleContextMenu = (event: MouseEvent, nodeData: any) => {
  event.preventDefault()
  event.stopPropagation()
  if (!nodeData) return

  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    node: nodeData as TreeNode,
  }
}

const showAddDialog = () => {
  if (!contextMenu.value.node) return
  currentParentNode.value = contextMenu.value.node
  contextMenu.value.visible = false
  addDialogVisible.value = true
}

const deleteCurrentNodeFromContext = () => {
  if (!contextMenu.value.node) return
  performDelete(contextMenu.value.node.id)
  contextMenu.value.visible = false
}

const deleteCurrentNode = () => {
  if (!currentTab.value?.selectedNode) return
  performDelete(currentTab.value.selectedNode.id)
}

const performDelete = (id: string) => {
  const removeRecursive = (nodes: TreeNode[]): boolean => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (!node) continue

      if (node.id === id) {
        nodes.splice(i, 1)
        return true
      }
      if (removeRecursive(node.children || [])) return true
    }
    return false
  }

  if (removeRecursive(currentTab.value?.treeData || [])) {
    if (currentTab.value?.selectedNode?.id === id) currentTab.value.selectedNode = null
    ElMessage.success('元件已删除')
  }
}

// ====================== 表格操作 ======================
const addTableRow = (key: string) => {
  if (!currentTab.value?.selectedNode) return
  if (!Array.isArray(currentTab.value.selectedNode.props_values[key])) {
    currentTab.value.selectedNode.props_values[key] = []
  }
  currentTab.value.selectedNode.props_values[key].push({ key: '', value: '' })
}

const removeTableRow = (key: string, index: number) => {
  if (!currentTab.value?.selectedNode) return
  const arr = currentTab.value.selectedNode.props_values[key]
  if (Array.isArray(arr)) arr.splice(index, 1)
}

const handleNodeClick = (node: TreeNode) => {
  currentTab.value!.selectedNode = node
}

const hideContextMenu = () => {
  contextMenu.value.visible = false
}

// ====================== 元件分组 ======================
const getAllowedChildren = (parentCategory: string) => {
  return componentDefs.value
    .filter((comp) => comp.parent_keys.includes(parentCategory))
    .sort((a, b) => (a.component_order || 999) - (b.component_order || 999))
}

const groupedAllowedChildren = computed(() => {
  if (!currentParentNode.value?.component_category) return []

  const allowed = getAllowedChildren(currentParentNode.value.component_category)
  const groups: Record<string, ComponentItem[]> = {}

  allowed.forEach((comp) => {
    const groupName = comp.component_type || '其他'
    if (!groups[groupName]) groups[groupName] = []
    groups[groupName].push(comp)
  })

  const order = [
    'sampler',
    'logiccontroller',
    'configelement',
    'timer',
    'preprocessors',
    'postprocessors',
    'assertion',
    'listener',
    'thread',
  ]
  return Object.keys(groups)
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))
    .map((group) => ({ group, items: groups[group] }))
})

const handleSave = async () => {
  try {
    const save_name = await ElMessageBox.prompt('请输入用例名称', '确认保存', {
      confirmButtonText: '确定保存',
      cancelButtonText: '取消',
      inputValue: currentTab.value?.case_name,
      inputPattern: /[\s\S]*/, // 正则校验（随便输）
      inputErrorMessage: '请输入内容', // 为空时报错
      autofocus: false,
    })
    const res = await manageApiTestCase({
      case_project_key: currentcaseProject.value?.case_project_key,
      case_branch_key: currentCaseBranch.value?.case_branch_key,
      case_folder_key: currentTab.value?.case_folder_key,
      case_key: currentTab.value?.case_key,
      case_name: save_name.value,
      case_content: currentTab.value?.xmlPreview,
      case_struct_data: currentTab.value?.treeData,
    })
    if (res.msg === '编辑成功') {
      ElMessage.success(res.msg)
    } else {
      ElMessage.error(res.msg)
    }
  } catch (error) {
    console.error(error)
  }
}

const handleDebug = async () => {
  if (!currentAgent.value) {
    ElMessage.warning('请选择执行节点')
    return
  }

  const res = await DebugApiTestCase({
    agent_key: currentAgent.value,
    case_name: '临时调试测试用例',
    case_content: currentTab.value?.xmlPreview,
  })

  if (res.msg === '任务下发成功') {
    ElMessage.success(res.msg)
  } else {
    ElMessage.error(res.msg)
  }
}
const pageSwitchChange = async () => {
  await fetch_testcases(
    currentcaseProject.value!.case_project_key,
    currentCaseBranch.value!.case_branch_key,
  )
}

const copy_case = async (item: any) => {
  const new_api_key = uuidv4()
  // console.log(item)
  const case_copy_data = {
    case_project_key: item.case_project_key,
    case_branch_key: item.case_branch_key,
    case_folder_key: item.case_folder_key,
    case_key: new_api_key,
    case_name: item.case_name + '_copy',
    case_content: item.case_content,
    case_struct_data: item.case_struct_data,
    viewMode: 'edit',
    type: 'case',
    label: item.case_name + '_copy',
  }

  const res = await manageApiTestCase({
    case_project_key: item.case_project_key,
    case_branch_key: item.case_branch_key,
    case_folder_key: item.case_folder_key,
    case_key: new_api_key,
    case_name: item.case_name + '_copy',
    case_content: item.case_content,
    case_struct_data: JSON.parse(item.case_struct_data),
  })
  if (res.msg === '编辑成功') {
    ElMessage.success('复制成功')
    testcasesData.value.push(case_copy_data)
    openCase(case_copy_data)
  } else {
    ElMessage.error(res.msg)
  }
}

const delete_case = async (item: any) => {
  const res = await delApiTestCase({
    case_project_key: item.case_project_key,
    case_branch_key: item.case_branch_key,
    case_key: item.case_key,
  })
  if (res.msg === '删除成功') {
    ElMessage.success(res.msg)
  } else {
    ElMessage.error(res.msg)
  }
}

const selectFolederValue = ref('')
const SelectCaseFolderDialogRef = ref<InstanceType<typeof GeneralDialog>>()

const move_case = async (item: any) => {
  await fetch_Folders()
  SelectCaseFolderDialogRef.value?.open(item)
}

const SelectCaseFolderConfirm = async (item: any) => {
  console.log(item)
  console.log(selectFolederValue.value)
  const case_move_data = {
    case_project_key: item.case_project_key,
    case_branch_key: item.case_branch_key,
    case_folder_key: selectFolederValue.value,
    case_key: item.case_key,
    case_name: item.case_name,
    case_content: item.case_content,
    case_struct_data: item.case_struct_data,
    viewMode: 'edit',
    type: 'case',
    label: item.case_name,
  }
  const res = await manageApiTestCase({
    case_project_key: item.case_project_key,
    case_branch_key: item.case_branch_key,
    case_folder_key: selectFolederValue.value,
    case_key: item.case_key,
    case_name: item.case_name,
    case_content: item.case_content,
    case_struct_data: JSON.parse(item.case_struct_data),
  })
  if (res.msg === '编辑成功') {
    ElMessage.success('移动成功')
    testcasesData.value.push(case_move_data)
    openCase(case_move_data)
  } else {
    ElMessage.error(res.msg)
  }
}

// ====================== 生命周期 ======================
onMounted(async () => {
  await fetch_case_projects()
  await fecthUserData(1, 50000)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', hideContextMenu)
})
</script>

<style scoped>
/* =============================================
   全局容器
============================================= */
.page-wrapper {
  height: 100%;
  padding: 8px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.breadcrumb {
  padding: 0 12px;
  margin-bottom: 12px;
}

.content-box {
  flex: 1;
  background: #ffffff;
  border-radius: 8px;
  padding-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* =============================================
   列表页
============================================= */
.list-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.project-card-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.project-card {
  width: 320px;
  border-radius: 10px;
  border: 1px solid #e8ecef;
  transition: all 0.25s ease;
}

.project-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  border-color: #d0e0ff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.card-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  padding: 0 8px !important;
  font-size: 13px !important;
}

.edit-btn {
  color: #3b82f6;
}

.delete-btn {
  color: #ef4444;
}

.card-content {
  padding: 4px 6px;
}

.content-item {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
  color: #4b5563;
}

.label {
  color: #6b7280;
  width: 80px;
  flex-shrink: 0;
}

.value {
  flex: 1;
}

.single-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* =============================================
   详情页 - 左侧布局核心
============================================= */
.detail-page {
  height: 100%;
}

.main-splitter {
  height: 100%;
}

.left-panel {
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
}

.left-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 顶部固定区域 */
.left-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  background: #fafafa;
  font-weight: 500;
  color: #374151;
}

.version-select {
  width: 90px;
}

/* 工具栏 */
.left-toolbar {
  height: 44px;
  padding: 8px 12px;
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
}

.left-toolbar .el-input {
  flex: 1;
}

/* 树滚动区 - 关键：撑满剩余空间 */
.tree-scroll-wrapper {
  flex: 1;
  min-height: 0;
  margin-top: 5px;
  overflow: hidden;
}

.api-tree {
  min-height: 100%;
}

/* 自定义树节点 */
.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 32px;
  padding: 0 8px 0 4px;
  font-size: 14px;
  color: #374151;
}

.custom-tree-node:hover {
  background: #f1f5f9;
}

.node-main {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.node-icon {
  font-size: 16px;
  margin-right: 6px;
}

.group-icon {
  color: #f59e0b;
}

.api-icon {
  color: #3b82f6;
}

.node-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-left: 16px;
}

.node-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.custom-tree-node:hover .node-actions {
  opacity: 1;
}

/* 底部固定项目切换 */
.left-footer {
  height: 30px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}

.project-switcher {
  width: 100%;
  height: 30px;
  padding: 0 12px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;
}

.project-switcher:hover {
  border-color: #a5b4fc;
  box-shadow: 0 0 0 3px rgba(165, 180, 252, 0.15);
}

.project-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #1f2937;
}

.project-name {
  font-weight: 500;
}

/* 项目下拉项 */
.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 180px;
}

/* 空卡片 */
.s-card {
  width: 180px;
  border-radius: 10px;
  border: 1px solid #e8ecef;
  transition: all 0.25s ease;
}

.s-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  border-color: #d0e0ff;
}

.s-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px;
}

.s-card-content {
  padding: 4px 6px;
}

.s-content-item {
  display: flex;
  font-size: 14px;
  color: #4b5563;
}

.branch-tabs {
  :deep(.el-tabs__header) {
    margin: 0 0 16px;
  }
  :deep(.el-tabs__item) {
    height: 36px;
    line-height: 36px;
    font-size: 14px;
  }
}

.mode-desc {
  line-height: 1.5;
}

:deep(.el-dialog__body) {
  padding: 20px 24px;
}

.dialog-footer-actions {
  margin-top: 16px;
  text-align: right;
}

.delete-confirm {
  text-align: center;
  padding: 24px 0;
}

.delete-confirm p {
  margin: 16px 0 8px;
  font-size: 16px;
  color: #1e293b;
}

.delete-confirm .sub-text {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.example-showcase .el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}

/* JMeter 树样式优化 */
.jmeter-tree :deep(.el-tree-node__content) {
  height: 36px;
  padding: 0 8px;
}

.jmeter-tree :deep(.el-tree-node__label) {
  font-size: 14px;
}

/* 右键菜单 */
.context-menu {
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
}

/* 属性面板美化 */
.el-form-item :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.table_toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px;
}

.table_actions {
  margin: 8px;
  display: flex;
  gap: 8px;
}
</style>
