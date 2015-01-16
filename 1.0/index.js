/**
 * @fileoverview 
 * @author lanmeng.bhy<lanmeng.bhy@taobao.com>
 * @module page
 **/
KISSY.add(function (S, Node, RichBase, Event, Uri) {

    var isString = S.isString;
    var sub = S.substitute;
    var one = S.one;
    var query = Uri.Query;
    
    var PRE_CLASS = 'page-';
    var FIRST_PAGE_CLASS = PRE_CLASS + 'first';
    var PREVIOUS_PAGE_CLASS = PRE_CLASS + 'previous';
    var NEXT_PAGE_CLASS = PRE_CLASS + 'next';
    var LAST_PAGE_CLASS = PRE_CLASS + 'last';
    var NUM_PAGE_CLASS = PRE_CLASS + 'num';
    var BTN_CLASS = PRE_CLASS + "btn";
    var SKIP_CLASS = PRE_CLASS + "skip";
    var TOTAL_CLASS = PRE_CLASS + "total";
    var CURRENT_CLASS = PRE_CLASS + "current";
    var DOT_CLASS = PRE_CLASS + "dot";
    
    var NUMBER_REG = /^[1-9]+[0-9]*$/;
        
        
    var page = RichBase.extend({
    
        /**
         * 初始化分页，bind事件
         * 如果容器不存在，则不做任何操作
         * @method _init
         * @private
         */
        initializer: function(){
            var self = this;
            self.container = self.get("container");
           

            if(self.container){
               
               //判断是否支持hash
               if(self.get('support_hash')){
                   self._getHash();
                   self._setHash();
               }
               
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
                    case FIRST_PAGE_CLASS:
                        self.goFirstPage();
                        break;
                    case PREVIOUS_PAGE_CLASS:
                        self.goPreviousPage();
                        break;
                    case NEXT_PAGE_CLASS:
                        self.goNextPage();
                        break;
                    case LAST_PAGE_CLASS: 
                        self.goLastPage();
                        break;
                    case NUM_PAGE_CLASS:
                        self.skip(node.html(), node);
                        break;

               };

            });

            Event.delegate(self.container, "click", "." + BTN_CLASS, function(e){
                //var t = this;
                var target = e.currentTarget;
                var pageNum = self.container.one("."+ SKIP_CLASS).val();

                if(/^\d+$/.test(pageNum) && pageNum > 0){
                    self.skip(pageNum, target);
                } else {
                    self.fire("page:error", {target: one(target)});
                }
                
                 
            });
            
            self.get('support_hash') && self.on('page:skip', self._setHash, self);
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
            self.htmlArr.push("<div class='page'>");

            var totalPage = self.get("total_page");
            var currentPage = self.get("current_page");
            //设置首页显示则显示首页
            //总数大于1页显示首页, 且当没有页数时
            var hasFirstPage = (totalPage > 0 && currentPage > 1);
            self.get("first_show") && self._getOnePageHtml(self.get("first_text"),  hasFirstPage,  FIRST_PAGE_CLASS);
            
            //上一页
            self.get("previous_show") && self._getOnePageHtml(self.get("previous_next"),  (currentPage > 1), PREVIOUS_PAGE_CLASS);
            

            //只有上一页下一页的时候没有页数，不显示分页信息
            if(totalPage > 0){
                var currentPage = self.get("current_page");
                var edgePage = self.get("edge_page");

                //获取分页边界值，连续数字得开始和结束点
                self._getBeginEnd();


                for(var i = 1; i <= edgePage; i++){
                    self._getOnePageHtml(i,  true, NUM_PAGE_CLASS);
                }
                
                if(self.startPage > (edgePage + 1) && self.get("edge_page")){
                    self._getOnePageHtml(self.get("dot_text"),  false, DOT_CLASS);
                }        
                
                var left = Math.max(edgePage + 1, self.startPage);
                for(var i = left; i <= self.endPage; i++){
                    self._getOnePageHtml(i,  true, NUM_PAGE_CLASS);
                }
                
                var right = totalPage - edgePage;
                if(self.endPage < right){
                    self._getOnePageHtml(self.get("dot_text"),  false, DOT_CLASS);
                }
                
                right = Math.max(self.endPage, right);
                for(var i = right + 1; i <= totalPage; i++){
                    self._getOnePageHtml(i,  true, NUM_PAGE_CLASS);
                }    
            }

            //下一页
            self.get("next_show") && self._getOnePageHtml(self.get("next_text"),  (currentPage < totalPage || totalPage == 0), NEXT_PAGE_CLASS);
        


            //设置首页显示则显示首页
            //总数大于1页显示首页
            var haslastPage = (currentPage < totalPage && totalPage > 1);
            self.get("last_show") && self._getOnePageHtml(self.get("last_text"),  haslastPage, LAST_PAGE_CLASS);
            
            //只有上一页下一页的时候不需要提供有多少页
            //总页数
            if(totalPage > 0){
                if(self.get("total_show")){
                    self._getOnePageHtml(sub(self.get("total_text"), {totalPage: totalPage}),  false,  TOTAL_CLASS);
                }


                //支持跳转
                self.get("skip_show") && self._setSkipHtml();
            }

            self.htmlArr.push("</div>");
            self.container.html(self.htmlArr.join(""));

        },

        /**
         * 重新设置总页数
         * @method changeTotalPage
         * @param totalPage {Int} 总页数 
         * @public
         */
        changeTotalPage: function(totalPage){
            var self = this;
            self.set("total_page", totalPage);
            self.renderPage();
        },
         
        /**
         * 重新设置当前选中页
         * @method setCurrentPage
         * @param currentPage {Int} 当前页
         * @public
         */
        setCurrentPage: function(currentPage){
            var self = this;
            self.set("current_page", currentPage);
            self.renderPage();
        },
        
        /**
         * 是否有上一页，主要给没有分页数字，只有上一页下一页使用
         * @method disablePreviousPage
         * @public
         */
        disablePreviousPage: function(){
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
        
        getCurrentNode: function(){
           return one('.' + CURRENT_CLASS);
        },
        
        /**
         * 返回总页数
         * @method getTotalPage
         * @public
         */
        getTotalPage: function(){
            return this.get("total_page");
        },

        //清楚事件绑定
        destory: function(){
            var self = this;
            Event.undelegate(self.container, 'click', 'a');
            Event.undelegate(self.container, "click", "." + BTN_CLASS);
        },

        
        /**
         * 跳转到第一页
         * @method goFirstPage
         * @param node {YUI NODE} 触发分页的节点
         * @public
         */
        goFirstPage: function(){
            var self = this;
            var target = one('.' + FIRST_PAGE_CLASS);
            
            self.skip(1, target);
            self.fire("page:firstPage", {target: target});
        },

        /**
         * 跳转到最后一页
         * @method goLastPage
         * @param node {YUI NODE} 触发分页的节点
         * @public
         */
        goLastPage: function(){
            var self = this;
            var target = one('.' + NUM_PAGE_CLASS);
            
            self.skip(self.get("total_page"), target);
            self.fire("page:lastPage", {target: target});
        },

        /**
         * 上一页，当前页必须大于1才有上一页
         * @method goPreviousPage
         * @param node {YUI NODE} 触发分页的节点
         * @public
         */
        goPreviousPage: function(){
            var self = this;
            var currentPage = self.get("current_page");
            var target = one('.' + PREVIOUS_PAGE_CLASS);
            
            if(currentPage > 1 || !totalPage){
                self.skip(--currentPage, target);
            }
            self.fire("page:previousPage", {target: target});
            
        },
        
        /**
         * 下一页，下一页必须小于总页数，或者是单纯的上一页下一页结构
         * @method goNextPage
         * @param node {YUI NODE} 触发分页的节点
         * @public
         */
        goNextPage: function(){
            var self = this;
            var currentPage = self.get("current_page");
            var totalPage = self.get("total_page");
            var target = one('.' + NEXT_PAGE_CLASS);
            
            if(currentPage < totalPage || !totalPage){        //max is 空未处理
                self.skip(++currentPage, target);
            }
            self.fire("page:nextPage", {target: target});
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
           var pageNum = Number(pageNum);
           
           self.fire("before:skip", {pageNum: pageNum, target: node});
           if(pageNum > 0 && pageNum <= self.get("total_page")){//判断是大于1的数字
                self.set("current_page", pageNum);
                self.renderPage();
                self.fire("after:skip", {pageNum: pageNum, target: node});
            }
            
            self.fire("page:skip", {pageNum: pageNum, target: node});
           // self.fire("page:skipError", {pageNum: pageNum, target: node});
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
                    className += (" " + CURRENT_CLASS);
                    self.htmlArr.push("<span class='" + className + "'>"+ text +"</span>");
                    return;
                }
                self.htmlArr.push("<a href='javascript:;' class='" + className + "'>"+ text +"</a>");
            } else {
                self.htmlArr.push("<span class='" + className + ' ' + className + "-disabled'>"+ text+"</span>");
            }

        },
        
        //获取跳转代码
        _setSkipHtml: function(){
            var self = this;
            var html = [];
            html.push(sub(self.get("skip_text"), {input: "<input type='text' class='" + SKIP_CLASS + "' >"}));
            html.push("<input type='button' class='"+ BTN_CLASS + "' value='"+ self.get("skip_btn") +"' >");

            self._getOnePageHtml(html.join(''),  false,  TOTAL_CLASS);
        },
        
        //设置hash值
        _setHash: function(){
            var self = this;
            var hash = window.location.hash;
            var hashObj = new query(hash.slice(1));
            
            hashObj.set(self.get('hash_name'), self.get('current_page'));
            window.location.hash = hashObj.toString();

        },
        
        //获取hash值
        _getHash: function(){
            var self = this;
            var hash = window.location.hash.slice(1);
            var currentPage = new query(hash).get(self.get('hash_name'));
            
            if(currentPage && NUMBER_REG.test(currentPage)){
               self.set('current_page', currentPage);
            }
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
	
	                //没有判断是不是kissy node 或者 html node
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
	                getter: function(val){
	                    if(val < this.get("edge_page")){
	                        return this.get("edge_page");
	                    }
	                    return val;
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
	                getter: function(val){
	                    if(val > this.get("total_page")){
	                        return this.get("total_page");
	                    }
	                    return val;
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
	
	            previous_next: {
	                value:  "上一页"  //文案
	            },
	
	            next_text: {
	                value: "下一页"  //文案
	            },
	
	            previous_show: {
	                value: false  //是否现实上一页
	            },
	
	            next_show: {
	                value: false  //是否现实下一页
	            },
	            
	            support_hash: {
	                value: false
	            },
	            
	            hash_name: {
	                value: 'page'
	            }
	        }
     });
     
    return page;
    
}, {requires:['node', 'rich-base', 'event', 'uri']});







