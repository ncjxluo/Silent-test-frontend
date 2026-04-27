<template>
  <div class="page-wrapper">
    <div
      style="display: flex; justify-content: space-between; align-items: center"
      class="mt-2 mb-2"
    >
      <el-breadcrumb :separator-icon="ArrowRight" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '#' }" @click="goPage('list', null)">
          接口项目列表
        </el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentPage === 'detail'"> 接口项目详情 </el-breadcrumb-item>
      </el-breadcrumb>
      <div v-if="currentPage === 'detail'" class="env-switcher flex items-center gap-2 mr-2">
        <el-select
          v-model="currentEnv"
          placeholder="请选择环境"
          class="env-select min-w-[160px]"
          popper-class="env-popper"
          :teleported="false"
          size="small"
        >
          <el-option
            v-for="item in envList"
            :key="item.env_key"
            :label="item.env_name"
            :value="item.env_key"
          >
            <div class="flex items-center gap-3 py-1">
              <div
                class="w-8 h-6 rounded-full flex items-center justify-center text-white text-base font-thin shrink-0"
                :style="{ color: item.env_color }"
              >
                {{ item.env_icon }}
              </div>
              <span class="text-gray-800">{{ item.env_name }}</span>
            </div>
          </el-option>
        </el-select>

        <el-icon @click="handleEnvManage"><Memo /></el-icon>
      </div>
    </div>

    <div class="content-box">
      <!-- 列表页 -->
      <div v-if="currentPage === 'list'" class="list-page">
        <div class="top-bar">
          <div class="page-title"></div>
          <el-button type="primary" @click="handleAddProject">
            <el-icon><Plus /></el-icon>
            创建项目
          </el-button>
        </div>

        <div class="project-card-list">
          <el-empty v-if="project_data.length === 0" description="暂无项目" :image-size="80" />
          <el-space wrap size="large">
            <el-card
              v-for="item in project_data"
              :key="item.project_key"
              class="project-card"
              shadow="hover"
              @click="goPage('detail', item)"
            >
              <template #header>
                <div class="card-header">
                  <div class="card-title">{{ item.project_name }}</div>
                  <div class="card-actions">
                    <el-button
                      class="action-btn edit-btn"
                      text
                      size="small"
                      @click.stop="handleProjectEdit(item)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      class="action-btn delete-btn"
                      text
                      size="small"
                      @click.stop="handleProjectDelete(item)"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
              </template>
              <div class="card-content">
                <div class="content-item">
                  <span class="label">项目描述：</span>
                  <span class="value single-line">{{ item.project_desc }}</span>
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
          ref="ProjectGeneralDialogRef"
          :title="project_dialog_title"
          :width="500"
          :confirmText="project_dialog_button_text"
          btype="primary"
          @confirm="handleProjectNew"
        >
          <el-form
            :model="project_form"
            label-width="120px"
            :rules="project_rules"
            ref="projectFormRef"
          >
            <el-form-item label="项目名" prop="project_name">
              <el-input v-model="project_form.project_name" placeholder="请输入项目名" />
            </el-form-item>
            <el-form-item label="项目描述">
              <el-input
                v-model="project_form.project_desc"
                type="textarea"
                :rows="3"
                placeholder="请输入项目描述"
              />
            </el-form-item>
          </el-form>
        </general-dialog>

        <general-dialog
          ref="DelProjectDialogRef"
          title="删除项目"
          :width="400"
          confirmText="确定删除"
          btype="danger"
          @confirm="delProjectConfirm"
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
                <span style="font-size: 14px">接口管理</span>
                <el-dropdown @command="handleBranchSwitch" trigger="click">
                  <div class="project-switcher">
                    <div class="project-info">
                      <el-icon><Icon icon="oui:branch" /></el-icon>
                      <span class="project-name">{{ currentBranch?.branch_name }}</span>
                    </div>
                  </div>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="branch in branch_data"
                        :key="branch.branch_key"
                        :command="branch"
                      >
                        <div class="project-item">
                          <div style="gap: 6px">
                            <el-icon><Icon icon="oui:branch" width="8" height="8" /></el-icon>
                            <span> {{ branch.branch_name }}</span>
                          </div>
                          <el-tag
                            v-if="branch.branch_key === currentBranch?.branch_key"
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
                <el-input v-model="keyword" placeholder="搜索接口" />
                <el-dropdown @command="handleDropdownCommand">
                  <el-button type="primary" :icon="Plus" size="small" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="addApi">新建接口</el-dropdown-item>
                      <el-dropdown-item command="addGroup">新建分组</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>

              <!-- 树 - 滚动区域 -->
              <div class="tree-scroll-wrapper">
                <el-scrollbar>
                  <el-empty
                    v-if="currentBranch?.branch_key === '0'"
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
                            <el-tag v-else size="small" :class="getMethodStyle(data.doc_method)">{{
                                data.doc_method
                              }}</el-tag>
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
                                <template v-if="data.type === 'api'">
                                  <el-dropdown-item command="rename_api"
                                  ><el-icon><Edit /></el-icon> 重命名</el-dropdown-item
                                  >
                                  <el-dropdown-item command="copy_api"
                                  ><el-icon><CopyDocument /></el-icon> 复制</el-dropdown-item
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
                                  ><el-icon><Plus /></el-icon> 新建接口</el-dropdown-item
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
                      <span class="project-name">{{ currentProject!.project_name }}</span>
                    </div>
                    <el-icon><CaretBottom /></el-icon>
                  </div>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="project in project_data"
                        :key="project.project_key"
                        :command="project"
                      >
                        <div class="project-item">
                          <span>{{ project.project_name }}</span>
                          <el-tag
                            v-if="project.project_key === currentProject!.project_key"
                            size="small"
                            type="success"
                          >当前</el-tag
                          >
                        </div>
                      </el-dropdown-item>
                      <el-dropdown-item command="manage" divided>
                        <el-icon><Setting /></el-icon> 项目管理
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </el-splitter-panel>
          <el-splitter-panel>
            <div class="h-full flex flex-col">
              <!-- 接口 tabs（多接口切换） -->
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
                  :key="tab.doc_key"
                  :label="renderTabLabel(tab)"
                  :name="tab.doc_key"
                />
              </el-tabs>
              <div class="flex-1 overflow-hidden bg-white">
                <div v-if="currentTab" class="h-full flex flex-col">
                  <el-tabs v-model="mode" type="card" class="flex-1 flex flex-col min-h-0">
                    <el-tab-pane name="design" class="h-full flex flex-col min-h-0">
                      <template #label>
                        <span class="custom-tabs-label">
                          <el-tooltip placement="top" effect="dark">
                            <template #content>设计页面允许手动设置参数</template>
                            <span>设计</span>
                          </el-tooltip>
                        </span>
                      </template>
                      <div class="shrink-0 px-4 py-4 border-b bg-white">
                        <div class="flex items-center gap-4 mx-auto">
                          <el-select v-model="currentTab.doc_method" class="w-28">
                            <el-option
                              v-for="item in httpMethods"
                              :key="item.value"
                              :label="item.value"
                              :value="item.value"
                            />
                          </el-select>
                          <el-input
                            v-model="currentTab.doc_path"
                            placeholder="接口路径,请以/开头.(如果路径带有http,则无需选择环境)"
                            class="flex-1"
                          />
                          <el-button type="primary" @click="api_doc_save">保存</el-button>
                          <el-button @click="mode = 'debug'">调试</el-button>
                        </div>
                      </div>
                      <div class="flex-1 overflow-y-auto">
                        <div class="p-4 mx-auto">
                          <div class="mb-2">
                            <el-input
                              v-model="currentTab.doc_desc"
                              type="textarea"
                              :rows="2"
                              placeholder="接口说明..."
                              class="w-full"
                            />
                          </div>
                          <div class="mb-2 p-4 bg-white border rounded-lg shadow-sm">
                            <h3 class="text-lg font-medium mb-2">请求参数</h3>
                            <el-tabs v-model="currentTab.paramsTab">
                              <el-tab-pane label="Params" name="params">
                                <GeneralDynamicTreeTable
                                  v-model="currentTab.apiParams"
                                  :columns="apiParamscolumns"
                                />
                              </el-tab-pane>
                              <el-tab-pane label="Body" name="body">
                                <el-radio-group size="small" v-model="currentTab.bodyparamsGroup" class="mb-2">
                                  <el-radio value="none">none</el-radio>
                                  <el-radio value="form_data">form-data</el-radio>
                                  <el-radio value="json">json</el-radio>
                                  <el-radio value="text">text</el-radio>
                                  <el-radio value="binary">binary</el-radio>
                                </el-radio-group>
                                <div class="mt-2" v-if="currentTab.bodyparamsGroup === 'none'">
                                  该接口没有任何参数需要传递
                                </div>
                                <div class="mt-2" v-if="currentTab.bodyparamsGroup === 'form_data'">
                                  <GeneralDynamicTreeTable
                                    v-model="currentTab.apiParamsFdata"
                                    :columns="apiParamsFdatacolumns"
                                  />
                                </div>
                                <div class="mt-2" v-if="currentTab.bodyparamsGroup === 'json'">
                                  <GeneralDynamicTreeTable
                                    v-model="currentTab.apiParamsJson"
                                    :columns="apiParamsJsoncolumns"
                                  />
                                </div>
                                <div class="mt-2" v-if="currentTab.bodyparamsGroup === 'text'">暂时未开放</div>
                                <div class="mt-2" v-if="currentTab.bodyparamsGroup === 'binary'">
                                  暂时未开放
                                </div>
                              </el-tab-pane>
                              <el-tab-pane label="Headers" name="headers">
                                <GeneralDynamicTreeTable
                                  v-model="currentTab.apiHeaderParams"
                                  :columns="headercolumns"
                                />
                              </el-tab-pane>
                              <!-- Body、Headers 类似 -->
                            </el-tabs>
                          </div>

                          <!-- 返回响应 -->
                          <div class="p-4 bg-white border rounded-lg shadow-sm">
                            <h3 class="text-lg font-medium mb-2">返回响应</h3>
                            <el-tabs type="card">
                              <el-tab-pane label="200 成功"></el-tab-pane>
                            </el-tabs>
                            <div class="flex items-center mb-4 text-sm text-gray-600">
                              <span class="mr-2"> HTTP 状态码: 200 名称: 成功 内容格式: </span>
                              <el-dropdown @command="handleCommand">
                                <span class="el-dropdown-link">
                                  {{ currentTab.res_content_type }}
                                  <el-icon class="el-icon--right">
                                    <arrow-down />
                                  </el-icon>
                                </span>
                                <template #dropdown>
                                  <el-dropdown-menu>
                                    <el-dropdown-item command="json">json</el-dropdown-item>
                                    <el-dropdown-item command="form-data"
                                    >form-data</el-dropdown-item
                                    >
                                  </el-dropdown-menu>
                                </template>
                              </el-dropdown>
                            </div>
                            <!-- 你的响应内容 -->
                            <div class="rounded mb-10">
                              <GeneralDynamicTreeTable
                                v-model="currentTab.apiResResult"
                                :columns="apiResResultolumns"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </el-tab-pane>
                    <el-tab-pane name="debug" class="h-full flex flex-col min-h-0">
                      <template #label>
                        <span class="custom-tabs-label">
                          <el-tooltip placement="top" effect="dark">
                            <template #content>调试页面允许快速测试</template>
                            <span>调试</span>
                          </el-tooltip>
                        </span>
                      </template>
                      <div class="shrink-0 px-4 py-4 border-b bg-white">
                        <div class="flex items-center gap-2 mx-auto">
                          <el-select v-model="currentTab.doc_method" class="w-28">
                            <el-option
                              v-for="item in httpMethods"
                              :key="item.value"
                              :label="item.value"
                              :value="item.value"
                            />
                          </el-select>
                          <el-input
                            v-model="currentTab.doc_path"
                            placeholder="接口路径"
                            class="flex-1"
                          />
                          <el-button type="primary" @click="api_doc_debug">发送</el-button>
                          <el-button @click="api_doc_conversion">
                            <el-tooltip placement="top" effect="dark">
                              参数映射
                              <template #content>
                                可以快速的将请求参数和响应参数映射到设计的表格中
                              </template>
                            </el-tooltip>
                          </el-button>
                          <el-button @click="api_doc_save">保存</el-button>
                        </div>
                      </div>
                      <div class="flex-1 overflow-y-auto">
                        <div class="p-4 mx-auto">
                          <div class="mb-2 p-4 bg-white border rounded-lg shadow-sm">
                            <h3 class="text-lg font-medium mb-2">请求参数</h3>
                            <el-tabs v-model="currentTab.paramsTab">
                              <el-tab-pane label="Params" name="params">
                                <GeneralDynamicTreeTable
                                  v-model="currentTab.apiParams"
                                  :columns="apiParamscolumns"
                                />
                              </el-tab-pane>
                              <el-tab-pane label="Body" name="body">
                                <el-radio-group size="small" v-model="currentTab.bodyparamsGroup" class="mb-2">
                                  <el-radio value="none">none</el-radio>
                                  <el-radio value="form_data">form-data</el-radio>
                                  <el-radio value="json">json</el-radio>
                                  <el-radio value="text">text</el-radio>
                                  <el-radio value="binary">binary</el-radio>
                                </el-radio-group>
                                <div class="mt-2" v-if="currentTab.bodyparamsGroup === 'none'">
                                  该接口没有任何参数需要传递
                                </div>
                                <div class="mt-2" v-if="currentTab.bodyparamsGroup === 'form_data'">
                                  <GeneralDynamicTreeTable
                                    v-model="currentTab.apiParamsFdata"
                                    :columns="apiParamsFdatacolumns"
                                  />
                                </div>
                                <div class="mt-2" v-if="currentTab.bodyparamsGroup === 'json'">
                                  <general-code
                                    v-model="currentTab.debug_json_params"
                                    language="typescript"
                                    theme="vs"
                                    style="height: 120px"
                                    :options="{ fontSize: 14, minimap: { enabled: false } }"
                                  />
                                </div>
                                <div class="mt-2" v-if="currentTab.bodyparamsGroup === 'text'">暂时未开放</div>
                                <div class="mt-2" v-if="currentTab.bodyparamsGroup === 'binary'">
                                  暂时未开放
                                </div>
                              </el-tab-pane>
                              <el-tab-pane label="Headers" name="headers">
                                <GeneralDynamicTreeTable
                                  v-model="currentTab.apiHeaderParams"
                                  :columns="headercolumns"
                                />
                              </el-tab-pane>
                            </el-tabs>
                          </div>
                          <!-- 返回响应 -->
                          <div class="p-4 bg-white border rounded-lg shadow-sm">
                            <h3 class="text-lg font-medium mb-2">返回响应</h3>
                            <general-code
                              v-model="currentTab.debug_res_params"
                              language="typescript"
                              theme="vs"
                              style="height: 380px"
                              class="mb-10"
                              :options="{ fontSize: 14, minimap: { enabled: false } }"
                            />
                          </div>
                        </div>
                      </div>
                    </el-tab-pane>
                  </el-tabs>
                </div>

                <!-- 空状态 -->
                <div v-else class="h-full flex items-center justify-center bg-gray-50">
                  <div class="flex gap-8">
                    <el-card class="s-card cursor-pointer" @click="createApi">新建HTTP接口</el-card>
                    <el-card class="s-card">⚡智能扫描接口</el-card>
                  </div>
                </div>
              </div>
            </div>
          </el-splitter-panel>
        </el-splitter>
      </div>
    </div>
  </div>

  <general-dialog
    ref="BranchGeneralDialogRef"
    :title="branch_dialog_title"
    :width="520"
    :confirmText="branch_dialog_button_text"
    btype="primary"
    @confirm="handleBranchNew"
  >
    <!-- 模式切换 Tabs -->
    <el-tabs v-model="branch_create_type" class="branch-tabs mb-5">
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
      :model="branch_form"
      label-width="110px"
      :rules="branch_rules"
      ref="branchFormRef"
      label-position="left"
    >
      <!-- 公共字段：分支名称 -->
      <el-form-item label="分支名称" prop="branch_name">
        <el-input
          v-model="branch_form.branch_name"
          placeholder="建议使用 feature/xxx、bugfix/xxx 等命名"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <!-- 仅复制分支时显示 -->
      <el-form-item v-if="branch_create_type === '2'" label="复制来源" required>
        <el-select
          v-model="source_branch"
          placeholder="请选择要复制的分支"
          filterable
          clearable
          class="w-full"
        >
          <el-option
            v-for="branch in branch_data"
            :key="branch.branch_key"
            :label="branch.branch_name"
            :value="branch.branch_key"
          >
            <span>{{ branch.branch_name }}</span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <!-- 底部提示（可选） -->
    <div v-if="branch_create_type === '2'" class="text-xs text-gray-500 mt-2">
      复制可能会花费较长的时间。
    </div>
  </general-dialog>

  <general-dialog
    ref="FolderGeneralDialogRef"
    :title="folder_dialog_title"
    :width="520"
    :confirmText="folder_dialog_button_text"
    btype="primary"
    @confirm="handleFolderNew"
  >
    <el-form
      :model="folder_form"
      label-width="110px"
      :rules="folder_rules"
      ref="folderFormRef"
      label-position="left"
    >
      <!-- 公共字段：分支名称 -->
      <el-form-item label="目录名称" prop="folder_name">
        <el-input
          v-model="folder_form.folder_name"
          placeholder="建议使用功能模块来命名"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
    </el-form>
  </general-dialog>

  <general-dialog
    ref="DelFolderDialogRef"
    title="删除目录"
    :width="400"
    confirmText="确定删除"
    btype="danger"
    @confirm="delFolderConfirm"
  >
    <div class="delete-confirm">
      <el-icon size="48" color="#F56C6C"><Warning /></el-icon>
      <p>确定要删除目录吗？</p>
      <p class="sub-text">删除目录会同步删除目录下的所有内容，此操作不可恢复</p>
    </div>
  </general-dialog>

  <general-dialog
    ref="EnvGeneralDialogRef"
    title="环境管理"
    :width="900"
    confirmText="保存"
    btype="primary"
    @confirm="handleEnvNew"
  >
    <div class="flex bg-white">
      <div class="w-56 border-r bg-gray-50 flex flex-col">
        <div class="px-3 py-2 mt-4 text-xs text-gray-400 uppercase">环境</div>
        <div
          v-for="env in envList"
          :key="env.env_key"
          class="px-3 py-2 flex items-center gap-2 cursor-pointer rounded"
          :class="activeEnv === env.env_key ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-100'"
          @click="handleSelectEnv(env)"
        >
          <div
            class="w-5 h-5 rounded text-xs flex items-center justify-center text-white"
            :style="{ backgroundColor: env.env_color }"
          >
            {{ env.env_icon }}
          </div>
          <span class="text-sm">{{ env.env_name }}</span>
        </div>
        <!-- 新建环境 -->
        <div
          class="px-3 py-2 mt-2 flex items-center gap-2 cursor-pointer text-purple-600 hover:bg-purple-50 rounded"
        >
          <el-icon><Plus /></el-icon>
          <span class="text-sm" @click="handleAddEnv">新建环境</span>
        </div>
      </div>
      <!-- 右侧内容 -->
      <div class="flex-1 flex flex-col overflow-hidden" v-if="envList.length === 0">
        <el-empty description="暂无环境" :image-size="80" />
      </div>
      <div class="flex-1 flex flex-col overflow-hidden" v-else>
        <!-- 顶部环境标题 -->
        <div class="p-4 border-b flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div
              class="w-6 h-6 rounded bg-purple-100 text-purple-600 text-xs flex items-center justify-center"
            >
              {{ activeEnv?.env_icon }}
            </div>
            <span class="text-lg font-medium">{{ activeEnv?.env_name }}</span>
          </div>
          <el-dropdown @command="handleEnvCommand">
            <span class="el-dropdown-link">
              更多操作
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="del_env">删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="p-6">
          <div class="text-sm font-medium mb-3">前置 URL</div>
          <div class="border rounded-lg overflow-hidden">
            <div class="flex bg-gray-50 border-b gap-2 text-sm text-gray-600 py-2 px-4">
              <div class="w-3/7">环境</div>
              <div class="w-4/7">前置 URL</div>
              <div class="w-1/7">颜色</div>
            </div>
            <div class="flex items-center py-2 gap-2 px-4 border-b">
              <div class="w-3/7 flex items-center gap-2">
                <el-input v-model="env_form.env_name" size="small" />
              </div>
              <div class="w-4/7 flex flex-col gap-1">
                <el-input v-model="env_form.env_url" size="small" />
              </div>
              <div class="w-1/7 flex flex-col gap-1">
                <el-color-picker v-model="env_form.env_color" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </general-dialog>
</template>

<script setup lang="ts">
import { onMounted, computed, h, ref } from 'vue'
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
  Files,
  Setting,
} from '@element-plus/icons-vue'
import GeneralDialog from '@/components/GeneralDialog.vue'
import { api_manager } from '@/hooks/ifaceauto/apimanager.ts'
import { ElForm, ElMessage, ElMessageBox } from 'element-plus'
import { system_users } from '@/hooks/systems/users.ts'
import { jsonToTreeData, mapKeyToLabel } from '@/utils/util.ts'
import { Icon, setCustomIconsLoader } from '@iconify/vue'
import GeneralDynamicTreeTable from '@/components/GeneralDynamicTreeTable.vue'
import GeneralCode from '@/components/GeneralCode.vue'
import { manage_api_env } from '@/api/ifaceauto.ts'
import { v4 as uuidv4 } from 'uuid'

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

// 首页的项目管理
const currentPage = ref('list')
// 定义当前选中的项目，当切换的时候更改这个
const currentProject = ref<ProjectItem>()

// 页面切换方法
const goPage = async (page: string, data: any) => {
  currentPage.value = page
  if (data !== null && data !== undefined) {
    currentProject.value = data
    await fetch_Branchs()
    get_master_branch()
    await fetchenvs()
    if (currentBranch.value?.branch_key !== '0') {
      await fetch_apis(currentProject.value!.project_key, currentBranch.value!.branch_key)
    }
  }
}

const {
  addApiProject,
  fetchApiProjects,
  editApiProject,
  delApiProject,
  fetchApiBranchs,
  addApiBranch,
  fetchApis,
  addApiFolder,
  editApiFolder,
  delApiFolder,
  manageApiEnv,
  delApiEnv,
  fetchEnvs,
  debugApi,
  manageApi,
  delApi,
} = api_manager()

// 项目的相关操作

const projectFormRef = ref<InstanceType<typeof ElForm> | null>(null)
const DelProjectDialogRef = ref<InstanceType<typeof GeneralDialog>>()
const ProjectGeneralDialogRef = ref<InstanceType<typeof GeneralDialog>>()

const project_dialog_title = ref('')
const project_dialog_button_text = ref('')
const project_dialog_action = ref('')

interface ProjectItem {
  project_key: string
  project_name: string
  project_desc: string | ''
  user_key: string
}

// 查询
const fetch_Projects = async () => {
  project_data.value = await fetchApiProjects({})
}

// 重置编辑框的内容
const handleProjectReset = () => {
  Object.assign(project_form.value, {
    project_name: '',
    project_desc: '',
  })
  // 可选：手动清除校验提示
  projectFormRef.value?.clearValidate()
}

//新增和编辑使用
const project_form = ref({
  project_name: '',
  project_desc: '',
})

const project_rules = {
  project_name: [{ required: true, message: '请输入项目名称', trigger: 'submit' }],
}

const project_data = ref<ProjectItem[]>([])

const handleAddProject = () => {
  handleProjectReset()
  project_dialog_title.value = '创建项目'
  project_dialog_button_text.value = '新增'
  project_dialog_action.value = '新增'
  ProjectGeneralDialogRef.value?.open()
}

const handleProjectEdit = (item: any) => {
  handleProjectReset()
  Object.assign(project_form.value, {
    project_name: item.project_name,
    project_desc: item.project_desc,
  })
  project_dialog_title.value = '编辑项目'
  project_dialog_button_text.value = '编辑'
  project_dialog_action.value = '编辑'
  ProjectGeneralDialogRef.value?.open(item)
}

// 新增项目
const handleProjectNew = async (data: any) => {
  projectFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (project_dialog_action.value === '新增') {
        const res = await addApiProject({
          project_name: project_form.value.project_name,
          project_desc: project_form.value.project_desc,
        })
        if (res.msg === '新增成功') {
          ElMessage.success(res.msg)
          await fetch_Projects()
        } else {
          ElMessage.error(res.msg)
        }
        ProjectGeneralDialogRef.value?.close()
      } else {
        const res = await editApiProject({
          project_key: data.project_key,
          project_name: project_form.value.project_name,
          project_desc: project_form.value.project_desc,
        })
        if (res.msg === '编辑成功') {
          ElMessage.success(res.msg)
          await fetch_Projects()
        } else {
          ElMessage.error(res.msg)
        }
        ProjectGeneralDialogRef.value?.close()
      }
    }
  })
}

// 删除项目
const handleProjectDelete = (item: any) => {
  DelProjectDialogRef.value?.open(item)
}

const delProjectConfirm = async (data: any) => {
  const res = await delApiProject({
    project_key: data.project_key,
  })
  if (res.msg === '删除成功') {
    ElMessage.success(res.msg)
    await fetch_Projects()
  } else {
    ElMessage.error(res.msg)
  }
  DelProjectDialogRef.value?.close()
}

// 处理项目切换
const handleProjectSwitch = async (project: any) => {
  if (project === 'manage') {
    goPage('list', '')
    return
  }
  currentProject.value = project
  await fetch_Branchs()
  get_master_branch()
  if (currentBranch.value?.branch_key !== '0') {
    await fetch_apis(currentProject.value!.project_key, currentBranch.value!.branch_key)
  }

  ElMessage.success(`已切换到项目`)
}
// --------------------------------------------------------
// 详情页分支相关操作

interface BranchItem {
  branch_key: string
  branch_name: string
  is_default: number
}
const branch_data = ref<BranchItem[]>([])
const branchFormRef = ref<InstanceType<typeof ElForm> | null>(null)
const BranchGeneralDialogRef = ref<InstanceType<typeof GeneralDialog>>()

const branch_create_type = ref('1')

const branch_dialog_title = ref('')
const branch_dialog_button_text = ref('')

// 确定来源的字段
const source_branch = ref('')

const branch_form = ref({
  branch_name: '',
})

const branch_rules = {
  branch_name: [{ required: true, message: '请输入分支名称', trigger: 'submit' }],
}

const handleBranchReset = () => {
  Object.assign(branch_form.value, {
    branch_name: '',
  })
  source_branch.value = ''
  // 可选：手动清除校验提示
  branchFormRef.value?.clearValidate()
}

const fetch_Branchs = async () => {
  branch_data.value = await fetchApiBranchs({
    project_key: currentProject.value!.project_key,
  })
}

// 定义当前的分支
const currentBranch = ref<BranchItem>()

const get_master_branch = () => {
  currentBranch.value = branch_data.value.find((branch) => branch.is_default === 1) || {
    branch_key: '0',
    branch_name: '暂无分支',
    is_default: 0,
  }
}

const handleBranchSwitch = async (branch: any) => {
  if (branch === 'create') {
    handleBranchReset()
    branch_dialog_title.value = '创建分支'
    branch_dialog_button_text.value = '创建'
    BranchGeneralDialogRef.value?.open()
    return
  } else if (branch === 'manage') {
    ElMessage.info('后续在开发针对分支维护方面的开发')
    return
  }
  currentBranch.value = branch
  await fetch_apis(currentProject.value!.project_key, currentBranch.value!.branch_key)
  ElMessage.success(`已切换到${branch.branch_name}分支`)
  // 这里可以加载对应项目的数据
}

const handleBranchNew = async (data: any) => {
  branchFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      const res = await addApiBranch({
        project_key: currentProject.value!.project_key,
        branch_name: branch_form.value.branch_name,
        branch_source: source_branch.value,
      })
      if (res.msg === '新增成功' || res.msg === '复制分支成功') {
        ElMessage.success(res.msg)
        BranchGeneralDialogRef.value?.close()
        await fetch_Branchs()
      } else {
        ElMessage.error(res.msg)
        BranchGeneralDialogRef.value?.close()
      }
    }
  })
}

// 环境相关的操作
interface EnvItem {
  env_key?: string
  env_name: string
  env_icon: string // 首字母
  env_url: string // 背景色类
  env_color: string // 背景色类
}

const currentEnv = ref('')
const EnvGeneralDialogRef = ref<InstanceType<typeof GeneralDialog>>()

const activeEnv = ref<EnvItem>()

const envList = ref<EnvItem[]>([])

const env_form = ref<EnvItem>({
  env_key: '',
  env_name: '',
  env_icon: '', // 首字母
  env_url: '', // 背景色类
  env_color: '',
})

const handleEnvManage = () => {
  if (envList.value.length > 0) {
    activeEnv.value = envList.value[0]
    env_form.value = { ...(envList.value[0] as EnvItem) }
  }
  EnvGeneralDialogRef.value?.open()
}

const handleSelectEnv = (env: EnvItem) => {
  activeEnv.value = env
  env_form.value = { ...env }
}

const handleAddEnv = async () => {
  const env = {
    env_key: uuidv4(),
    env_name: '新建环境',
    env_url: '',
    env_icon: '新',
    env_color: '#7C3AED',
  }
  envList.value.push(env)
  activeEnv.value = env
  env_form.value = { ...env }
}

const fetchenvs = async () => {
  const res: { envs: EnvItem[] } = await fetchEnvs({})
  envList.value = res.envs
}

const handleEnvNew = async () => {
  env_form.value.env_icon = env_form.value.env_name.charAt(0)
  const res = await manageApiEnv(env_form.value)
  if (res.msg === '编辑成功') {
    ElMessage.success(res.msg)
    await fetchenvs()
    const index = envList.value.findIndex((item) => item.env_key === env_form.value.env_key)
    if (index !== -1) {
      envList.value[index] = { ...env_form.value }
    }
  } else {
    ElMessage.error(res.msg)
  }
}

const handleEnvCommand = async (cmd: string) => {
  if (cmd === 'del_env') {
    try {
      await ElMessageBox.confirm('确定删除这个环境吗？', '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      })
      if (activeEnv.value?.env_name === '新建环境') {
        envList.value = envList.value.filter((item) => item.env_key !== activeEnv.value?.env_key)
        activeEnv.value = envList.value[0]
        env_form.value = { ...(envList.value[0] as EnvItem) }
        ElMessage.success('删除成功')
      } else {
        await delApiEnv({
          env_key: activeEnv.value?.env_key,
        })
        envList.value = envList.value.filter((item) => item.env_key !== activeEnv.value?.env_key)
        if (envList.value.length > 0) {
          activeEnv.value = envList.value[0]
          env_form.value = { ...(envList.value[0] as EnvItem) }
        }
        ElMessage.success('删除成功')
      }
    } catch {}
  }
}

// --------------------------------------------------------

// 详情页目录的相关方法

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
  doc_req_params: string
  doc_req_required: string
  doc_res_status: string
  doc_res_content_type: string
  doc_res_params: string
  doc_res_required: string
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

const defaultProps = {
  children: 'children',
  label: 'label',
}

const keyword = ref('')

const filteredTreeData = computed(() => {
  // console.log(apisData.value)
  if (!keyword.value) return apisData.value

  const filterTree = (nodes: any[]): any[] => {
    return nodes.filter((node) => {
      // 如果节点名称包含关键词
      // console.log(keyword.value)
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
  return filterTree(JSON.parse(JSON.stringify(apisData.value)))
})

const getMethodStyle = (method: string) => {
  const colorMap: Record<string, string> = {
    GET: 'text-green-500',
    POST: 'text-blue-500',
    PUT: 'text-orange-500',
    DELETE: 'text-red-500',
  }
  return colorMap[method?.toUpperCase()] || {}
}

const httpMethods = ref([
  { value: 'GET', color: 'text-green-500' },
  { value: 'POST', color: 'text-blue-500' },
  { value: 'PUT', color: 'text-orange-500' },
  { value: 'DELETE', color: 'text-red-500' },
])

// 添加分组
const FolderGeneralDialogRef = ref<InstanceType<typeof GeneralDialog>>()
const folder_form = ref({
  folder_name: '',
})
const folder_rules = {
  folder_name: [{ required: true, message: '请输入目录名称', trigger: 'submit' }],
}

const folderFormRef = ref<InstanceType<typeof ElForm> | null>(null)

const folder_dialog_title = ref('')
const folder_dialog_button_text = ref('')
const folder_dialog_action = ref('')

const DelFolderDialogRef = ref<InstanceType<typeof GeneralDialog>>()

const handleDropdownCommand = (command: string) => {
  if (currentBranch.value?.branch_key === '0') {
    ElMessage.warning('没有建立分支时，不允许创建接口和分组')
    return
  }
  if (command === 'addApi') {
    createApi('', '')
  } else if (command === 'addGroup') {
    createGroup()
  }
}

// 添加标签页
const addtab = () => {
  createApi('', '')
}

// 关闭Tab
const removeTab = (key: string) => {
  const idx = tabs.value.findIndex((t) => t.doc_key === key)
  if (idx !== -1) {
    tabs.value.splice(idx, 1)
    if (tabs.value.length > 0) {
      const newIndex = Math.max(0, idx - 1)
      const target = tabs.value[newIndex]
      if (target) {
        activeTab.value = target.doc_key
      }
      // activeTab.value = tabs.value[Math.max(0, idx - 1)].doc_key
    } else {
      activeTab.value = ''
    }
  }
}

// 处理树节点点击（用于打开接口）
const handleTreeItemClick = (data: any) => {
  if (data.type === 'api') {
    openApi(data)
  }
}

// Tab标题渲染
const renderTabLabel = (tab: any) => {
  return h('span', { class: 'flex items-center gap-1' }, [
    h('span', { class: `text-xs ${getMethodStyle(tab.doc_method)}` }, tab.doc_method),
    h('span', {}, tab.label),
  ])
}

const createGroup = () => {
  Object.assign(folder_form.value, {
    folder_name: '',
  })
  folder_dialog_title.value = '新增目录'
  folder_dialog_button_text.value = '新增'
  folder_dialog_action.value = '新增'
  FolderGeneralDialogRef.value?.open()
}

const editGroup = (data: any) => {
  Object.assign(folder_form.value, {
    folder_name: '',
  })
  Object.assign(folder_form.value, {
    folder_name: data.folder_name,
  })
  folder_dialog_title.value = '编辑目录'
  folder_dialog_button_text.value = '编辑'
  folder_dialog_action.value = '编辑'
  FolderGeneralDialogRef.value?.open(data)
}

const deleteGroup = (data: any) => {
  DelFolderDialogRef.value?.open(data)
}

const delFolderConfirm = async (data: any) => {
  const res = await delApiFolder({
    folder_key: data.folder_key,
  })

  if (res.msg === '删除成功') {
    ElMessage.success(res.msg)
    DelFolderDialogRef.value?.close()
    apisData.value.forEach((item, index) => {
      if (item.type === 'group') {
        const folder = item as ApisData
        if (
          folder.folder_key === data.folder_key &&
          folder.project_key === data.project_key &&
          folder.branch_key === data.branch_key
        ) {
          apisData.value.splice(index, 1)
        }
      }
    })
  } else {
    ElMessage.error(res.msg)
    DelFolderDialogRef.value?.close()
  }
}

const handleFolderNew = async (data: any) => {
  folderFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (folder_dialog_action.value === '新增') {
        const new_folder_key = uuidv4()
        const res = await addApiFolder({
          project_key: currentProject.value!.project_key,
          branch_key: currentBranch.value!.branch_key,
          folder_key: new_folder_key,
          folder_name: folder_form.value.folder_name,
        })
        if (res.msg === '新增成功') {
          ElMessage.success(res.msg)
          FolderGeneralDialogRef.value?.close()
          apisData.value.push({
            project_key: currentProject.value!.project_key,
            branch_key: currentBranch.value!.branch_key,
            folder_key: new_folder_key,
            folder_name: folder_form.value.folder_name,
            folder_order: 1,
            type: 'group',
            label: folder_form.value.folder_name,
            children: [],
          })
        } else {
          ElMessage.error(res.msg)
          FolderGeneralDialogRef.value?.close()
        }
      } else {
        const res = await editApiFolder({
          folder_key: data.folder_key,
          folder_name: folder_form.value.folder_name,
        })
        if (res.msg === '编辑成功') {
          ElMessage.success(res.msg)
          FolderGeneralDialogRef.value?.close()
          apisData.value.forEach((item) => {
            if (item.type === 'group') {
              const folder = item as ApisData
              if (
                folder.folder_key === data.folder_key &&
                folder.project_key === data.project_key &&
                folder.branch_key === data.branch_key
              ) {
                folder.folder_name = folder_form.value.folder_name
                folder.label = folder_form.value.folder_name
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
      createApi('group', nodeData.folder_key)
      break
    case 'rename_api':
      ElMessage.info('正在开发')
      break
    case 'copy_api':
      ElMessage.info('正在开发')
      break
    case 'delete_api':
      ElMessage.info('正在开发')
      handleDelete(nodeData)
      break
  }
}

const handleDelete = async (nodelData: any) => {
  // console.log(nodelData)
  const res = await delApi({
    doc_key: nodelData.doc_key,
  })
  if (res.msg === '删除成功') {
    ElMessage.success(res.msg)
    removeTab(nodelData.doc_key)
    apisData.value = removeNode(apisData.value, nodelData)
  } else {
    ElMessage.error(res.msg)
  }
}

const removeNode = (data: any, nodelData: any) => {
  return data.filter((node: any) => {
    if (node.type === 'api' && node.doc_key === nodelData.doc_key) {
      return false
    }
    if (node.children && node.children.length > 0) {
      node.children = removeNode(node.children, nodelData)
    }
    return true
  })
}

// Tabs
interface TabItem {
  doc_key: string
  doc_name: string
  doc_method: string
  doc_path: string
  doc_desc: string
  folder_key?: string   // 保存时需要
  // 每个 Tab 自己独立的数据（关键修复）
  apiParams: any[]
  apiParamsFdata: any[]
  apiParamsJson: any[]
  apiHeaderParams: any[]
  apiResResult: any[]
  paramsTab: string
  debug_res_params: string
  bodyparamsGroup: string
  debug_json_params: string
  res_content_type: string
  label: string
}


const tabs = ref<TabItem[]>([])

const activeTab = ref('')

const currentTab = computed(() =>
  tabs.value.find((t: TabItem) => t.doc_key === activeTab.value)
)

// const currentApi = computed(() => tabs.value.find((t) => t.doc_key === activeTab.value))

// 编辑器
const mode = ref('design')

// 树
const expandedKeys = ref<string[]>([])

// 新建接口（空状态点击）
const createApi = (api_add_type: string, folder_key: string = '') => {
  // reset()
  const new_api_key = uuidv4()
  const api_init_data = {
    project_key: currentProject.value!.project_key,
    branch_key: currentBranch.value!.branch_key,
    folder_key: folder_key,
    doc_key: new_api_key,
    doc_name: '新建接口',
    doc_transfer_protocol: 'http:',
    doc_ip: '',
    doc_port: '',
    doc_path: '',
    doc_method: 'GET',
    doc_operationId: '',
    doc_req_content_type: '',
    doc_req_params: '[]',
    doc_req_required: '[]',
    doc_res_status: '',
    doc_res_content_type: '',
    doc_res_params: '[]',
    doc_res_required: '[]',
    doc_order: 0,
    doc_desc: '',
    doc_debug_json: '',
    type: 'api',
    label: '新建接口',
  }
  if (api_add_type === 'group') {
    apisData.value.forEach((item) => {
      if (item.type === 'group') {
        const folder = item as ApisData
        if (
          folder.folder_key === folder_key &&
          folder.project_key === currentProject.value!.project_key &&
          folder.branch_key === currentBranch.value!.branch_key
        ) {
          folder.children.push(api_init_data)
        }
      }
    })
    expandedKeys.value.push(folder_key)
    openApi(api_init_data)
  } else {
    apisData.value.push(api_init_data)
    openApi(api_init_data)
  }
}

const merge_object = (data: any[], rule: { key: string; value: string; type: string }) => {
  const result = data.reduce((acc, item) => {
    // 判断类型
    if (item[rule.type] === 'number') {
      acc[item[rule.key]] = Number(item[rule.value])
    } else {
      acc[item[rule.key]] = item[rule.value]
    }
    return acc
  }, {})

  return result
}

const openApi = (data: any) => {
  console.log(data)
  const existing = tabs.value.find(t => t.doc_key === data.doc_key)
  if (existing) {
    activeTab.value = data.doc_key
    return
  }
  const newTab: TabItem = {
    doc_key: data.doc_key,
    doc_name: data.doc_name || '新建接口',
    doc_method: data.doc_method || 'GET',
    doc_path: data.doc_path || '',
    doc_desc: data.doc_desc || '',
    folder_key: data.folder_key,
    label: data.doc_name || '新建接口',
    // 每个 Tab 独立保存一份数据
    apiParams: data.doc_method === 'GET'
      ? JSON.parse(data.doc_req_params || '[]')
      : [],
    apiParamsFdata: data.doc_req_content_type === 'form_data'
      ? JSON.parse(data.doc_req_params || '[]')
      : [],
    apiParamsJson: (data.doc_method === 'POST' && data.doc_req_content_type === 'json')
      ? JSON.parse(data.doc_req_params || '[]')
      : [],
    apiHeaderParams: [], // headers 通常独立，可根据需要从 data 中取
    apiResResult: JSON.parse(data.doc_res_params || '[]'),
    paramsTab: 'params',
    debug_res_params: '',
    bodyparamsGroup: data.doc_req_content_type || 'none',
    debug_json_params: JSON.stringify(merge_object(JSON.parse(data.doc_req_params),{key:"name",value:"example",type:"type"}),null,2) || '',
    res_content_type: data.doc_res_content_type || 'json',
  }

  tabs.value.push(newTab)
  activeTab.value = newTab.doc_key
  // tabs.value.push(data)
  // activeTab.value = data.doc_key
  // if (data.doc_method === 'GET') {
  //   apiParams.value = JSON.parse(data.doc_req_params)
  // } else if (data.doc_method === 'POST') {
  //   bodyparamsGroup.value = data.doc_req_content_type
  //   if (data.doc_req_content_type === 'form_data') {
  //     apiParamsFdata.value = JSON.parse(data.doc_req_params)
  //   } else if (data.doc_req_content_type === 'json') {
  //     apiParamsJson.value = JSON.parse(data.doc_req_params)
  //
  //     debug_json_params.value = JSON.stringify(merge_object(JSON.parse(data.doc_req_params),{key:"name",value:"example",type:"type"}),null,2)
  //     // const d_j_p = data.doc_req_params.fi
  //     // debug_json_params.value = JSON.stringify(JSON.parse(data.doc_req_params), null, 2)
  //     // debug_res_params.value = JSON.stringify(JSON.parse(data.doc_req_params), null, 2)
  //   }
  // }
  // res_content_type.value = data.doc_res_content_type
  // apiResResult.value = JSON.parse(data.doc_res_params)
}

// 接口组件的相关定义
// const paramsTab = ref('params')
// const bodyparamsGroup = ref('none')

interface ColumnConfig {
  prop: string
  label: string
  type?: 'input' | 'select' | 'radio'
  width?: string
  options?: Array<{ label: string; value: any }>
  defaultValue?: any
}

const apiParamscolumns = [
  {
    prop: 'name',
    label: '参数名',
    type: 'input' as const,
    width: '180px',
  },
  {
    prop: 'example',
    label: '参数值',
    type: 'input' as const,
    width: '160px',
  },
  {
    prop: 'type',
    label: '类型',
    type: 'select' as const,
    width: '120px',
    options: [
      { label: 'string', value: 'string' },
      { label: 'integer', value: 'integer' },
      { label: 'long', value: 'long' },
      { label: 'number', value: 'number' },
      { label: 'boolean', value: 'boolean' },
      { label: 'object', value: 'object' },
      { label: 'array', value: 'array' },
    ],
  },
  {
    prop: 'desc',
    label: '说明',
    type: 'input' as const,
    width: '260px',
  },
] as const satisfies ColumnConfig[]
// const apiParams = ref([])

const apiParamsFdatacolumns = [
  {
    prop: 'name',
    label: '参数名',
    type: 'input' as const,
    width: '180px',
  },
  {
    prop: 'example',
    label: '参数值',
    type: 'input' as const,
    width: '160px',
  },
  {
    prop: 'type',
    label: '类型',
    type: 'select' as const,
    width: '120px',
    options: [
      { label: 'string', value: 'string' },
      { label: 'integer', value: 'integer' },
      { label: 'long', value: 'long' },
      { label: 'number', value: 'number' },
      { label: 'boolean', value: 'boolean' },
      { label: 'object', value: 'object' },
      { label: 'array', value: 'array' },
    ],
  },
  {
    prop: 'desc',
    label: '说明',
    type: 'input' as const,
    width: '260px',
  },
] as const satisfies ColumnConfig[]
// const apiParamsFdata = ref<any[]>([])

const apiParamsJsoncolumns = [
  {
    prop: 'name',
    label: '参数名',
    type: 'input' as const,
    width: '180px',
  },
  {
    prop: 'example',
    label: '参数值',
    type: 'input' as const,
    width: '160px',
  },
  {
    prop: 'type',
    label: '类型',
    type: 'select' as const,
    width: '120px',
    options: [
      { label: 'string', value: 'string' },
      { label: 'integer', value: 'integer' },
      { label: 'long', value: 'long' },
      { label: 'number', value: 'number' },
      { label: 'boolean', value: 'boolean' },
      { label: 'object', value: 'object' },
      { label: 'array', value: 'array' },
    ],
  },
  {
    prop: 'desc',
    label: '说明',
    type: 'input' as const,
    width: '260px',
  },
] as const satisfies ColumnConfig[]
// const apiParamsJson = ref<any[]>([])

const apiResResultolumns = [
  {
    prop: 'name',
    label: '参数名',
    type: 'input' as const,
    width: '180px',
  },
  {
    prop: 'type',
    label: '类型',
    type: 'select' as const,
    width: '120px',
    options: [
      { label: 'string', value: 'string' },
      { label: 'integer', value: 'integer' },
      { label: 'long', value: 'long' },
      { label: 'number', value: 'number' },
      { label: 'boolean', value: 'boolean' },
      { label: 'object', value: 'object' },
      { label: 'array', value: 'array' },
    ],
  },
  {
    prop: 'status',
    label: '是否必须返回',
    type: 'radio' as const,
    width: '60px',
    options: [
      { label: '是', value: true },
      { label: '否', value: false },
    ],
  },
  {
    prop: 'desc',
    label: '说明',
    type: 'input' as const,
    width: '260px',
  },
] as const satisfies ColumnConfig[]
// const apiResResult = ref<any[]>([])

const headercolumns = [
  {
    prop: 'name',
    label: '参数名',
    type: 'input' as const,
    width: '180px',
  },
  {
    prop: 'example',
    label: '参数值',
    type: 'input' as const,
    width: '160px',
  },
  {
    prop: 'desc',
    label: '说明',
    type: 'input' as const,
    width: '260px',
  },
] as const satisfies ColumnConfig[]
// const apiHeaderParams = ref<any[]>([])

const handleCommand = (command: any) => {
  currentTab.value!.res_content_type = command
}

// const res_content_type = ref('json')
//
// const debug_json_params = ref('')
// const debug_res_params = ref('')

//接口文档的保存 调试 转换(根据参数规则)

const api_doc_save = async () => {
  try {
    if (!currentTab.value) return
    const save_name = await ElMessageBox.prompt('请输入接口名称', '确认保存', {
      confirmButtonText: '确定保存',
      cancelButtonText: '取消',
      inputValue: currentTab.value!.doc_name,
      inputPattern: /[\s\S]*/, // 正则校验（随便输）
      inputErrorMessage: '请输入内容', // 为空时报错
    })
    const res = await manageApi({
      project_key: currentProject.value!.project_key,
      branch_key: currentBranch.value!.branch_key,
      folder_key: currentTab.value.folder_key,
      doc_key: currentTab.value.doc_key,
      doc_name: save_name.value,
      doc_method: currentTab.value.doc_method,
      doc_path: currentTab.value.doc_path,
      doc_desc: currentTab.value.doc_desc,
      apiParams: currentTab.value.apiParams,
      apiParamsFdata: currentTab.value.apiParamsFdata,
      apiParamsJson: currentTab.value.apiParamsJson,
      debug_json_params: currentTab.value.debug_json_params,
      req_content_type: currentTab.value.bodyparamsGroup,
      res_content_type: currentTab.value.res_content_type,
      apiResResult: currentTab.value.apiResResult,
      version: currentBranch.value!.branch_name,
      author:
        mapKeyToLabel(currentProject.value?.user_key, tableDatas.value, 'user_key', 'nickname') ||
        '佚名',
    })
    if (res.msg === '编辑成功') {
      ElMessage.success(res.msg)
      await fetch_apis(currentProject.value!.project_key, currentBranch.value!.branch_key)
    } else {
      ElMessage.error(res.msg)
    }
  } catch (error) {
    console.error(error)
  }
}

const getSelectEnv = () => {
  return envList.value.find((t) => t.env_key === currentEnv.value) || null
}

const api_doc_debug = async () => {
  if (!currentTab.value) return
  const res = await debugApi({
    env_key: currentEnv.value,
    env_url: getSelectEnv()?.env_url || '',
    doc_method: currentTab.value.doc_method,
    doc_path: currentTab.value.doc_path,
    apiHeaderParams: currentTab.value.apiHeaderParams,
    apiParams: currentTab.value.apiParams,
    apiParamsFdata: currentTab.value.apiParamsFdata,
    apiParamsJson: currentTab.value.apiParamsJson,
    debug_json_params: currentTab.value.debug_json_params,
    req_content_type: currentTab.value.bodyparamsGroup,
  })
  currentTab.value.debug_res_params = JSON.stringify(JSON.parse(res.res), null, 2)
}

const api_doc_conversion = async () => {
  if (!currentTab.value) return
  if (currentTab.value.debug_json_params !== '') {
    const req_json = jsonToTreeData(JSON.parse(currentTab.value.debug_json_params), apiParamscolumns)
    // console.log(req_json)
    currentTab.value.apiParamsJson = req_json
  }
  if (currentTab.value.debug_res_params !== '') {
    const res_json = jsonToTreeData(JSON.parse(currentTab.value.debug_res_params), apiResResultolumns)
    // console.log(res_json)
    currentTab.value.apiResResult = res_json
  }
}

// const reset = () => {
//   apiParams.value=[]
//   bodyparamsGroup.value='none'
//   apiParamsFdata.value=[]
//   apiParamsJson.value=[]
//   apiHeaderParams.value=[]
//   res_content_type.value='json'
//   apiResResult.value=[]
//   debug_json_params.value=''
//   debug_res_params.value=''
// }

// 加载组件的时候挂载
onMounted(async () => {
  await fetch_Projects()
  await fecthUserData(1, 50000)
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
  width: 150px;
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
</style>
