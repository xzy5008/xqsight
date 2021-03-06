/**
 * Created by user on 2015/12/14.
 */

saicfc.nameSpace.reg("sys.role");

(function(){
    sys.role.roleMain = function(){
        var ctxData = saicfc.utils.getServerPath("system");

        /**
         * 申明内部对象
         * @type {saicfc.pmpf}
         */
        var obj = this;

        /**
         * 列表对象
         *
         * @type {{}}
         */
        this.roleTable = {};
        this.roleTree = {};
        this.curSelTree={};

        /**
         * 初始化调用 function
         */
        this.init = function() {
            /**
             * 查询
             */
            $(".btn-search").click(function(){
                obj.roleTable.ajax.reload();
            });
            
            $(document).bind("keydown",".filter input",function(e){
                var theEvent = window.event || e;
                var code = theEvent.keyCode || theEvent.which;
                if (code == 13) {
                    obj.roleTable.ajax.reload();
                }
            });
            /**
             * 重置
             */
            $("#btn-undo").click(function(){
                saicfc.utils.cleanValue(".filter");
            });

            /**
             * 新增
             */
            $("#btn-plus").on("click",obj.newFun);

            /**
             * 修改
             */
            $("#btn-edit").on("click",obj.editFun);

            /**
             * 删除
             */
            $("#btn-remove").on("click",obj.removeFun);

            /**
             * 加载列表
             */
            obj.loadRoleTreeFun();
            obj.loadRoleTableFun();
        };

        /**
         * 新增 function
         */
        this.newFun = function(){
            saicfc.win.show("角色新增","system/role/roleManage.html?parentId=" + obj.curSelTree.id,600,300,false);
        }

        /**
         * 修改 function
         */
        this.editFun = function(){
            var selRows = obj.roleTable.rows(".info").data();
            if(selRows.length < 1){
                saicfc.win.alert("请选择修改的数据");
                return;
            }
            saicfc.win.show("角色修改","system/role/roleManage.html?roleId=" + selRows[0].roleId,600,300,false);
        }

        /**
         * 删除 function
         */
        this.removeFun = function(){
            var selRows = obj.roleTable.rows(".info").data();
            if(selRows.length < 1){
                saicfc.win.alert("请选择删除的数据");
                return;
            }
            saicfc.win.confirm("确认删除吗？",function(btn){
                if(btn == "yes"){
                    $.ajax({
                        "url": ctxData + "/sys/role/delete?date=" + new Date().getTime(),
                        "data": encodeURI(encodeURI("roleId=" + selRows[0].roleId )),
                        "dataType": "jsonp",
                        "cache": false,
                        "success": function(retData){
                            saicfc.win.alert(retData.msg,retData.status);
                            if(retData.status == "0"){
                                obj.loadRoleTreeFun();
                            }
                        }
                    });
                }
            });
        }

        /**
         * 加载数据表 function
         */
        this.loadRoleTableFun = function(){
            var record_table = $("#role-table").DataTable({
                "bAutoWidth" : false,
                "bFilter" : false,// 搜索栏
                "bSort" : false,
                "bInfo" : false,// Showing 1 to 10 of 23 entries 总记录数没也显示多少等信息
                "bServerSide" : true,
                "paging":   false,
                "sAjaxSource": ctxData + '/sys/role/query',
                "fnServerData": function (sUrl, aoData, fnCallback) {
                    $.ajax({
                        "url": sUrl,
                        "data": aoData,
                        "success": function(data){
                            fnCallback(data);
                            //渲染结束重新设置高度
                            parent.saicfc.common.setIframeHeight($.getUrlParam(saicfc.iframeId));
                        },
                        "dataType": "jsonp",
                        "cache": false
                    });
                },
                "fnServerParams": function (aoData) {
                    var parentId = 0;
                    if(obj.curSelTree.id != undefined ){
                        parentId = obj.curSelTree.id;
                    }
                    aoData.push(
                        { "name": "roleName", "value": $("#roleName").val() },
                        { "name": "parentId", "value": parentId }
                    );
                },
                "aoColumnDefs": [
                    {
                        sDefaultContent: '',
                        aTargets: [ '_all' ]
                    }
                ],
                "aoColumns": [{
                    data : "roleId",
                    sWidth : "1",
                    render : function(value){
                        return '<label class="pos-rel"><input id="' + value + '" type="checkbox" class="ace" /><span class="lbl"></span></label>';
                    }
                },{
                    "data": "roleName",
                    sWidth : "100",
                    sClass : "text-center",
                    sSort : false
                },{
                    "data": "roleCode",
                    sWidth : "100",
                    sClass : "text-center",
                    sSort : false
                },{
                    "data": "createTime",
                    sWidth : "100",
                    sClass : "text-center",
                    render : function(value){
                        return saicfc.moment.formatYMD(value);
                    }
                },{
                    "data": "remark",
                    sWidth : "100",
                    sClass : "text-left"
                },{
                    "data": "roleId",
                    sWidth : "80",
                    sClass : "text-center",
                    render : function(){
                        return "<div class='bolder'>"
                        + "<a class='red' href='javaScript:roleMain.editFun()'><i class='ace-icon fa fa-edit'></i></a> | "
                        + "<a class='red' href='javaScript:roleMain.removeFun()'><i class='ace-icon fa fa-remove'></i></a> "
                        + "</div> ";
                    }
                },{
                    "data": "roleId",
                    sWidth : "120",
                    sClass : "text-center",
                    render : function(value){
                        return "<div class='bolder'>"
                            + "<a class='red' href='javaScript:roleMain.addUserFun(\"" + value + "\")'>添加用户</a> | "
                            + "<a class='red' href='javaScript:roleMain.addmenuFun(\"" + value + "\")'>分配权限</a> "
                            + "</div> ";
                    }
                }]
            });

            obj.roleTable = record_table;

            //单选事件
            $("#role-table tbody").on("click","tr",function() {
                $.each($("#role-table tbody").find("input[type='checkbox']"),function(index,object){
                    object.checked = false;
                });
                $(this).find("input[type='checkbox']").get(0).checked = true;
                $("#role-table>tbody>tr").removeClass("info");
                $(this).addClass("info");
            });

            $("#role-table tbody").on("dblclick","tr",function() {
                obj.editFun();
            });
        }

        this.addUserFun = function(roleId){
            var selRows = obj.roleTable.rows(".info").data();
            saicfc.win.show("添加用户","system/role/addUser.html?roleId=" + selRows[0].roleId,$(window).width()-150,$(window).height());
        }


        this.addmenuFun = function(roleId){
            var selRows = obj.roleTable.rows(".info").data();
            saicfc.win.show(selRows[0].roleName + "[" + selRows[0].roleCode + "]权限","system/role/addMenu.html?roleId=" + selRows[0].roleId,400,$(window).height(),false);
        }

        /*** 加载 tree **/
        this.loadRoleTreeFun = function () {
            $.ajax({
                url: ctxData + "/sys/role/queryalltree?date="+new Date().getTime(),
                dataType: "jsonp",
                success: function(retData){
                    if(retData.status == 0){
                        $.fn.zTree.init($("#roleTree"),{
                            check: {
                                enable: false,
                            },
                            data: {
                                simpleData: {
                                    enable: true
                                }
                            },
                            callback: {
                                onClick: function onClick(event, treeId, treeNode) {
                                    obj.roleTree.selectNode(treeNode);
                                    obj.curSelTree = treeNode;
                                    obj.roleTable.ajax.reload();

                                    return false;
                                }
                            }
                        }, retData.data);

                        obj.roleTree = $.fn.zTree.getZTreeObj("roleTree");

                        if(obj.curSelTree.id != undefined ){
                            obj.roleTree.selectNode(obj.curSelTree);
                        }else{
                            var nodes = obj.roleTree.getNodes();
                            if (nodes.length>0) {
                                obj.roleTree.selectNode(nodes[0]);
                                obj.curSelTree = nodes[0];
                            }
                        }

                        obj.roleTree.expandAll(true);

                        obj.roleTable.ajax.reload();
                    }
                    //渲染结束重新设置高度
                    parent.saicfc.common.setIframeHeight($.getUrlParam(saicfc.iframeId));
                }
            });
        }

        /**
         *
         * 新增编辑回调函数
         *
         */
        this.editCallBackFun = function(params){
            //加载数据
            obj.loadRoleTreeFun();
            if(params.roleId== undefined || params.roleId =="" ){
                return;
            }
            //选中之前选中的数据

        }
    };

    /**
     * 初始化数据
     */
    $(document).ready(function() {
        roleMain.init();
    });
})();
var roleMain = new sys.role.roleMain();





