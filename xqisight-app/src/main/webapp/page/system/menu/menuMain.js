/**
 * Created by user on 2015/12/14.
 */

saicfc.nameSpace.reg("sys.menu");

(function(){
    sys.menu.menuMain = function(){
        var ctxData = saicfc.utils.getServerPath("system");

        /**
         * 申明内部对象
         * @type {saicfc.pmpf}
         */
        var obj = this;

        this.menuTable = {};
        this.menuTree = {};
        this.curSelTree={};

        /**
         * 初始化调用 function
         */
        this.init = function() {
            /**
             * 查询
             */
            $(".btn-search").click(function(){
                obj.menuTable.ajax.reload();
            });
            $(document).bind("keydown",".filter input",function(e){
                var theEvent = window.event || e;
                var code = theEvent.keyCode || theEvent.which;
                if (code == 13) {
                    obj.menuTable.ajax.reload();
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
            $("#btn-plus").on("click",obj.plusFun);

            /**
             * 修改
             */
            $("#btn-edit").on("click",obj.editFun);

            /**
             * 删除
             */
            $("#btn-remove").on("click",obj.removeFun);

            obj.loadMenuTreeFun();
            obj.loadMenuTableFun();

        };


        /**
         * 新增 function
         */
        this.plusFun = function(){
            if(obj.curSelTree.id == undefined ){
                saicfc.win.alert("请选择要添加的节点");
                return;
            }
            saicfc.win.show("菜单新增","system/menu/menuManage.html?parentId=" + obj.curSelTree.id,$(window).width()-150,500);
        }

        /**
         * 修改 function
         */
        this.editFun = function(){
            var selRows = obj.menuTable.rows(".info").data();
            if(selRows.length < 1){
                saicfc.win.alert("请选择修改的数据");
                return;
            }
            saicfc.win.show("菜单修改","system/menu/menuManage.html?menuId=" + selRows[0].menuId,$(window).width()-150,500);
        }

        /**
         * 删除 function
         */
        this.removeFun = function(){
            var selRows = obj.menuTable.rows(".info").data();
            if(selRows.length < 1){
                saicfc.win.alert("请选择修改的数据");
                return;
            }
            saicfc.win.confirm("确认删除吗？",function(btn){
                if(btn == "yes"){
                    $.ajax({
                        "url": ctxData + "/sys/menu/delete?date=" + new Date().getTime(),
                        "data": {menuId : selRows[0].menuId },
                        "success": function(retData){
                            saicfc.win.alert(retData.msg,retData.status);
                            if(retData.status == "0"){
                               obj.loadMenuTreeFun();
                            }
                        }
                    });
                }
            });
        }

        /**
         * 加载数据表 function
         */
        this.loadMenuTableFun = function(){
            var record_table = $("#menu-table").DataTable({
                "bAutoWidth" : false,
                "bFilter" : false,// 搜索栏
                "bSort" : false,
                "bInfo" : false,// Showing 1 to 10 of 23 entries 总记录数没也显示多少等信息
                "bServerSide" : true,
                "paging":   false,
                "sAjaxSource": ctxData + '/sys/menu/query',
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
                        { "name": "menuName", "value": $("#menuName").val() },
                        { "name": "parentId", "value": parentId }
                    );
                },
                aoColumnDefs: [
                    {
                        sDefaultContent: '',
                        aTargets: [ '_all' ]
                    }
                ],
                aoColumns: [{
                    data : "menuName",
                    sWidth : "2",
                    render : function(value){
                        return '<label class="pos-rel"><input id="' + value + '" type="checkbox" class="ace" /><span class="lbl"></span></label>';
                    }
                },{
                    "data": "menuName",
                    sWidth : "100",
                    sClass : "text-center",
                    sSort : false
                },{
                    "data": "type",
                    sWidth : "60",
                    sClass : "text-center",
                    sSort : false,
                    render : function(value){
                        return value == "0" ? "菜单" : "功能";
                    }
                },{
                    "data": "url",
                    sWidth : "200",
                    sClass : "text-left"
                },{
                    "data": "icon",
                    sWidth : "40",
                    sClass : "text-center",
                    render : function (value) {
                        return "<span class='menu-icon fa " + (value == "" ? "fa-caret-right" : value) + "'></span>";
                    }
                },{
                    "data": "sort",
                    sWidth : "60",
                    sClass : "text-center"
                },{
                    "data": "createTime",
                    sWidth : "80",
                    sClass : "text-center",
                    render : function(value){
                        return saicfc.moment.formatYMD(value);
                    }
                },{
                    "data": "menuId",
                    sWidth : "80",
                    sClass : "text-center",
                    render : function(){
                        return "<div class='bolder'> <a class='red' href='javaScript:menuMain.editFun()'><i class='ace-icon fa fa-edit'></i></a> | " +
                            "<a class='red' href='javaScript:menuMain.removeFun()'><i class='ace-icon fa fa-remove'></i></a></div> ";
                    }
                }]
            });

            obj.menuTable = record_table;

            //单选事件
            $("#menu-table tbody").on("click","tr",function() {
                $.each($("#menu-table tbody").find("input[type='checkbox']"),function(index,object){
                    object.checked = false;
                });
                $(this).find("input[type='checkbox']").get(0).checked = true;
                $("#menu-table>tbody>tr").removeClass("info");
                $(this).addClass("info");
            });

            $("#menu-table tbody").on("dblclick","tr",function() {
                obj.editFun();
            });
        }

        /*** 加载 tree **/
        this.loadMenuTreeFun = function () {
            $.ajax({
                url: ctxData + "/sys/menu/querytree?date="+new Date().getTime(),
                dataType: "jsonp",
                success: function(retData){
                    if(retData.status == 0){
                        $.fn.zTree.init($("#menuTree"),{
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
                                    obj.menuTree.selectNode(treeNode);
                                    obj.curSelTree = treeNode;
                                    obj.menuTable.ajax.reload();
                                    //阻止事件冒泡
                                    event.stopPropagation();
                                    //阻止事件执行
                                    event.preventDefault();
                                    return false;
                                }
                            }
                        }, retData.data);

                        obj.menuTree = $.fn.zTree.getZTreeObj("menuTree");

                        if(obj.curSelTree.id != undefined ){
                            obj.menuTree.selectNode(obj.curSelTree);
                        }else{
                            var nodes = obj.menuTree.getNodes();
                            if (nodes.length>0) {
                                obj.menuTree.selectNode(nodes[0]);
                                obj.curSelTree = nodes[0];
                            }
                        }

                        obj.menuTree.expandAll(true);

                        obj.menuTable.ajax.reload();
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
            obj.loadMenuTreeFun();
            if(params.menuId== undefined || params.menuId =="" ){
                return;
            }
            //选中之前选中的数据

        }


    };

    /**
     * 初始化数据
     */
    $(document).ready(function() {
        menuMain.init();
    });
})();
var menuMain = new sys.menu.menuMain();





