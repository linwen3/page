/**
 * @fileoverview 
 * @author lanmeng.bhy<lanmeng.bhy@taobao.com>
 * @module page
 **/
KISSY.add(function (S, Node,Base, Event) {
    var isString = S.isString;
    var sub = S.substitute;
    var one = S.one;
        
    /**
     * 
     * @class Page
     * @constructor
     * @extends Base
     */
    function Pagination(comConfig) {
        var self = this;
        //调用父类构造函数
        Pagination.superclass.constructor.call(self, comConfig);
        
        self._init.apply(self, arguments);
    }
    
    S.extend(Pagination, Base, {
    
        /**
         * 初始化分页，bind事件
         * 如果容器不存在，则不做任何操作
         * @method _init
         * @private
         */
        _init: function(){
            var self = this;
            self.container = self.get("container");

            if(self.container){
                
                //获取不可变的属性
                self.renderPage();
                self.bindUI();
            }
            
        },
    
        /**
         * 绑定事件
         * 采用代理进行事件绑定，绑定a标签和搜索分页按钮
         * a标签判断是第一页，上一页，下一页，最后一页和数字页码的点击，分别调用不同的方法
         * 搜索分页按钮调用需要判断输入是否为数字，如果不为数字，报错
         * @method bindUI
         * @public
         */
        bindUI: function(){
            var self = this;
            
            Event.delegate(self.container, "click", 'a', function(e){
               var node = one(e.currentTarget);
               var className = node.attr("class");

               switch (className){
                    case "pagination-first":
                        self.firstPage(node);
                        break;
                    case "pagination-preview":
                        self.previewPage(node);
                        break;
                    case "pagination-next":
                        self.nextPage(node);
                        break;
                    case "pagination-last": 
                        self.lastPage(node);
                        break;
                    case "pagination-num":
                        self.skip(node.html(), node);
                        break;

               };

            });

            Event.delegate(self.container, "click", "input[class=pagination-btn]", function(e){
                //var t = this;
                var pageNum = self.container.one(".pagination-skip").get("value");

                if(/^\d+$/.test(pageNum) && pageNum > 0){
                    self.skip(pageNum, e.currentTarget);
                } else {
                    self.fire("page:error");
                }
                
                 
            });
        },

        /**
         * 分页显示
         * 根据配置显示上一页，下一页等信息
         * 原理： 根据连续显示页面条数 获取当前页应该连续显示的上下边界，再根据边界值显示省略号
         * @method renderPage
         * @public
         */
        renderPage: function(){
            var self = this;
            self.htmlArr = [];
            self.htmlArr.push("<div class='pagination'>");

            var totalPage = self.get("total_page");
            var currentPage = self.get("current_page");
            
            //设置首页显示则显示首页
            //总数大于1页显示首页, 且当没有页数时
            var hasFirstPage = (totalPage > 0 && currentPage > 1);
            self.get("first_show") && self._getOnePageHtml(self.get("first_text"),  hasFirstPage, "pagination-first");
            
            //上一页
            self.get("preview_show") && self._getOnePageHtml(self.get("preview_text"),  (currentPage > 1), "pagination-preview");
            

            //只有上一页下一页的时候没有页数，不显示分页信息
            if(totalPage > 0){
                var currentPage = self.get("current_page");
                var edgePage = self.get("edge_page");

                //获取分页边界值，连续数字得开始和结束点
                self._getBeginEnd();


                for(var i = 1; i <= edgePage; i++){
                    self._getOnePageHtml(i,  true, "pagination-num");
                }
                
                if(self.startPage > (edgePage + 1) && self.get("edge_page")){
                    self._getOnePageHtml(self.get("dot_text"),  false, "pagination-dot");
                }        
                
                var left = Math.max(edgePage + 1, self.startPage);
                for(var i = left; i <= self.endPage; i++){
                    self._getOnePageHtml(i,  true, "pagination-num");
                }
                
                var right = totalPage - edgePage;
                if(self.endPage < right){
                    self._getOnePageHtml(self.get("dot_text"),  false, "pagination-dot");
                }
                
                right = Math.max(self.endPage, right);
                for(var i = right + 1; i <= totalPage; i++){
                    self._getOnePageHtml(i,  true, "pagination-num");
                }    
            }

            //下一页
            self.get("next_show") && self._getOnePageHtml(self.get("next_text"),  (currentPage < totalPage || totalPage == 0), "pagination-next");
        


            //设置首页显示则显示首页
            //总数大于1页显示首页
            var haslastPage = (currentPage < totalPage && totalPage > 1);
            self.get("last_show") && self._getOnePageHtml(self.get("last_text"),  haslastPage, "pagination-last");
            
            //只有上一页下一页的时候不需要提供有多少页
            //总页数
            if(totalPage > 0){
                if(self.get("total_show")){
                    self._getOnePageHtml(sub(self.get("total_text"), {totalPage: totalPage}),  false, "pagination-total");
                }


                //支持跳转
                self.get("skip_show") && self._setSkipHtml();
            }

            self.htmlArr.push("</div>");
            self.container.html(self.htmlArr.join(""));

        },

        /**
         * 重新设置总页数
         * @method changetTotalPage
         * @param totalPage {Int} 总页数 
         * @public
         */
        changetTotalPage: function(totalPage){
            var self = this;
            self.set("total_page", totalPage);
             //t.renderPage();
        },
         
        /**
         * 重新设置当前选中页
         * @method setCurrentPage
         * @param currentPage {Int} 当前页
         * @public
         */
        setCurrentPage: function(currentPage){
            var self = this;
            self.set("currentPage", currentPage);
            self.renderPage();
        },
        
        /**
         * 是否有上一页，主要给没有分页数字，只有上一页下一页使用
         * @method disablePreviewPage
         * @public
         */
        disablePreviewPage: function(){
            var self = this;
            self.set("total_page", self.currentPage);
            self.renderPage();
        },
        
        /**
         * 是否有下一页，主要给没有分页数字，只有上一页下一页使用
         * @method disableNextPage
         * @public
         */
        disableNextPage: function(){
            var self = this;
            self.currentPage = 0;
            self.renderPage();
        },
        
        /**
         * 返回当前页
         * @method getCurrentPage
         * @public
         */
        getCurrentPage: function(){
            return this.get("current_page");
        },
        
        /**
         * 返回总页数
         * @method getToatalPage
         * @public
         */
        getToatalPage: function(){
            return this.get("total_page");
        },

        
        /**
         * 跳转到第一页
         * @method firstPage
         * @param node {YUI NODE} 触发分页的节点
         * @public
         */
        firstPage: function(node){
            var self = this;
            self.skip(1, node);
            self.fire("page:firstPage");
        },

        /**
         * 跳转到最后一页
         * @method lastPage
         * @param node {YUI NODE} 触发分页的节点
         * @public
         */
        lastPage: function(node){
            var t = this;
            self.skip(self.get("total_page"), node);
            self.fire("page:lastPage");
        },

        /**
         * 上一页，当前页必须大于1才有上一页
         * @method previewPage
         * @param node {YUI NODE} 触发分页的节点
         * @public
         */
        previewPage: function(node){
            var self = this;
            var currentPage = self.get("current_page");
            if(currentPage > 1 || !totalPage){
                self.skip(--currentPage, node);
            }
            self.fire("page:previewPage");
            
        },
        
        /**
         * 下一页，下一页必须小于总页数，或者是单纯的上一页下一页结构
         * @method nextPage
         * @param node {YUI NODE} 触发分页的节点
         * @public
         */
        nextPage: function(node){
            var self = this;
            var currentPage = self.get("current_page");
            var totalPage = self.get("total_page");
            if(currentPage < totalPage || !totalPage){        //max is 空未处理
                self.skip(++currentPage, node);
            }
            self.fire("page:nextPage");
        },

        /**
         * 跳转到指定页
         * @method skip
         * @param pageNum {Int} 页数
         * @param node {YUI NODE} 触发分页的节点
         * @public
         */
        skip: function(pageNum, node){
           var self = this;
           if(pageNum){//判断是大于1的数字
                self.set("current_page", parseInt(pageNum));
            }
            self.fire("page:skip", {pageNum: pageNum, node: node});
            self.renderPage();
        },

  
        //获取连续页的开始和结束
        _getBeginEnd: function(){
            
            var self = this;
            var totalPage = self.get("total_page");
            var currentPage = self.get("current_page");
            var edgePage = self.get("edge_page");
            var continuousPage = self.get("continuous_page");

            self.startPage = currentPage - Math.floor(continuousPage/2);
            self.endPage = currentPage + Math.floor(continuousPage/2);

            if(self.startPage <= 1){
                self.startPage = 1;
                self.endPage = Math.min(totalPage, self.startPage + continuousPage - 1);
                return; 
            }

            if(self.endPage >= totalPage){
                self.endPage = totalPage;
                self.startPage = Math.max(1, self.endPage - continuousPage + 1);
            }


        },
       
        //组织一个分页节点
        _getOnePageHtml: function(text, isLink, className){ 
            var self = this;
            var currentPage = self.get("current_page");
            if(isLink){
                if(currentPage == text){
                    className += " pagination-current"
                }
                self.htmlArr.push("<a href='#' class='" + className + "'>"+ text +"</a>");
            } else {
                self.htmlArr.push("<span class='" + className + "'>"+ text+"</span>");
            }

        },
        
        //获取跳转代码
        _setSkipHtml: function(){
            var self = this;
            var html = [];
            html.push(sub(self.get("skip_text"), {input: "<input type='text' class='pagination-skip' >"}));
            html.push("<input type='button' class='pagination-btn' value='"+ self.get("skip_btn") +"' >");

            self._getOnePageHtml(html.join(''),  false, "pagination-total");
        }

    }, {
         ATTRS :  {
	    
	           /**
	            * My property description.  Like other pieces of your comment blocks, 
	            * this can span multiple lines.
	            * 
	            * @property propertyName
	            * @type {Object}
	            * @default "foo"
	            */
	            container: {
	                value: null,
	
	                //没有判断是不是yui node 或者 html node
	                getter: function(n){
	                    if(isString(n)){
	                        return one(n);
	                    }
	                    return n;
	                }
	            },
	
	            total_page: {
	                value: 0
	            },
	
	            continuous_page: {   //最多可以看到的页数
	                value: 5,
	                gettter: function(val){
	                    if(val < this.get("edge_page")){
	                        return this.get("edge_page");
	                    }
	                }
	            },
	
	            current_page: {
	                value: 1
	            },
	           
	            //暂时无用，但是kissy有这个参数，以后可能会有场景用到
	            linlk_to: {
	                value: "#"
	            },
	
	            edge_page: {
	                value: 2,      //两边可以看到的页数
	                gettter: function(val){
	                    if(val < this.get("total_page")){
	                        return this.get("total_page");
	                    }
	                }
	            },
	
	            total_show: {
	                value: false  //是否显示总页数
	            },
	
	            total_text: {
	               value: "共{totalPage}页"
	            }, 
	
	            skip_show: {
	                value: false  //是否支持跳转
	            },
	
	            skip_text: {
	                value: "到第{input}页"
	            },
	
	            skip_btn: {
	                value: "确定"
	            },
	
	            dot_text: {
	                value: "..."
	            },
	
	            first_show: {
	                value: false  //首页是否显示
	            },
	
	            first_text: {
	                value: "首页"
	            },
	
	            last_show: {
	                value: false  //末页是否现实
	            },
	
	            last_text: {
	                value: "末页"
	            },
	
	            preview_text: {
	                value:  "上一页"  //文案
	            },
	
	            next_text: {
	                value: "下一页"  //文案
	            },
	
	            preview_show: {
	                value: false  //是否现实上一页
	            },
	
	            next_show: {
	                value: false  //是否现实下一页
	            }
	        }
     });
     
    return Pagination;
    
}, {requires:['node', 'base', 'event']});







