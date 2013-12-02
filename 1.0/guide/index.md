## page(分页组件)

* 版本：1.0
* 教程：[http://gallery.kissyui.com/page/1.0/guide/index.html](http://gallery.kissyui.com/page/1.0/guide/index.html)
* demo：[http://gallery.kissyui.com/page/1.0/demo/index.html](http://gallery.kissyui.com/page/1.0/demo/index.html)

### 组件介绍
* 根据已知总页数，生成带页码的分页
* 未知总页数的情况下，可以显示‘上一页’、‘下一页’
* 支持用户自定义跳转页码
* 支持设置各种文案，包括‘上一页’、‘下一页’、‘共x页’等
* 支持设置当前页左右显示多少页，例如当前页是5，左右个显示2也，则出现的效果为 3 4 5 6 7连续页面
* 可以支持设置边缘显示多少页，例如当前页是8，共20页， 左右边缘个显示2页，则效果为 1 2 ... 7 8 9 ... 19 20


### 初始化
* 完整版分页

		<div id="page1"></div>
		<script>
	        KISSY.use('gallery/page/1.0/index', function (S, page) {
	            var pageObj = new page({
	            	container: "#page1",
	            	total_page: 11,
	            	continuous_page: 5,
	            	current_page: 6,
	            	preview_show: true,
	            	first_show: true,
	            	next_show: true,
	            	last_show: true,
	            	edge_page: 2,
	            	skip_show: true
	             });
	               
	         });
		</script>

* 淘宝版分页（显示为：上一页 4 5 6 ... 下一页）

	 	<div id="page2"></div>
	 	<script type="text/javascript">
		    KISSY.use('gallery/page/1.0/index', function (S, page) {
		        var pageObj = new page({
	           	    container: "#page2",
	           	    total_page: 20,
	           	    continuous_page: 5,
	           	    current_page: 7,
	           	    preview_show: true,    
	           	    next_show: true,      
	           	    edge_page: 0
	           });
			});
		</script>

* 仅有上一页、下一页

	 	<div id="page3"></div>
	 	<script type="text/javascript">
	 		KISSY.use('gallery/page/1.0/index', function (S, page) {
	 			new page({
	 				container: "#page3",
	 				total_page: 0,
	 				preview_show: true,
	 				next_show: true
	 		    });
		
			});
		</script>
	
* 添加自定义事件

	 	<div id="page4"></div>
	 	<script type="text/javascript">
	 		KISSY.use('gallery/page/1.0/index', function (S, page) {
	 		    var pageObj = new page({
	 		        container: "#page4",
	 		        total_page: 0,
	 		        preview_show: true,
	 		        next_show: true
	 		     });
			
	             pageObj.on("page:skip", function(e){
	                 alert(e.pageNum);
	             });
			
			});
	    </script>
		

### Attibute

|attribute|type|defaultValue|description|
|:---------------|:--------|:----|:----------|
|container| String/kissyNode/htmlNode | null | 存放分页的容器 |
|preClass| String | 'page-' | 样式前缀 |
|total_page | Number | 0 | 总页数 |
|continuous_page| Number | 5 | 最多可以连续看到的页数，如果小于边缘页数，则设置为边缘页数（edge_page） |
|linlk_to| String | '#' | 暂时无用，以后可能会有场景用到 |
|edge_page| Number | 2 | 两边可以看到的页数，如果大于总页数，则设置为总页数 |
|total_show| Boolean | false | 是否显示总页数 |
|total_text| String | '共{totalPage}页' | 总页数文案 |
|skip_show| Boolean | false | 是否支持跳转 |
|skip_text| String | '到第{input}页' | 跳转文案 |
|skip_btn| String | '确定' | 跳转按钮文案 |
|dot_text| String | '...' | 省略文案 |
|first_show| Boolean | false | 首页是否显示 |
|first_text| String | '首页' | 首页文案 |
|last_show| Boolean | false | 是否显示末页|
|last_text| String| '末页' | 末页文案 |

|preview_show| Boolean |  false | 是否显示上一页 |
|preview_text| String | '上一页' | 上一页文案 |
|next_show| Boolean | false | 是否显示下一页 |
|next_text| String | '下一页' | 下一页文案 |
|support_hash| Boolean | false | 是否读取设置hash |
|hash_name| String | 'page' | hash的name |


### Events

|event|param|description|
|:----|:----|:----------|
|page:error| e.target：触发事件的节点 | 点击分页按钮出错 |
|page:firstPage| e.target：触发事件的节点 | 去第一页 |
|page:lastPage| e.target：触发事件的节点 | 去最后一页 |
|page:previewPage| e.target：触发事件的节点| 上一页 |
|page:nextPage| e.target：触发事件的节点| 下一页 |
|page:skip|e.target：触发事件的节点； e.pageNum: 跳转的页数| 跳转到第几页，跳转成功以后触发 |
|before:skip|e.target：触发事件的节点； e.pageNum: 跳转的页数| 跳转到第几页，跳转成功以后触发 |
|after:skip|e.target：触发事件的节点； e.pageNum: 跳转的页数| 跳转到第几页，跳转成功以后触发 |


### Method

|method|param|description|
|:-----|:----|:----------|
|renderPage|  | 重新显示分页，根据配置显示上一页，下一页等信息；原理： 根据连续显示页面条数 获取当前页应该连续显示的上下边界，再根据边界值显示省略号  |
|changetTotalPage| xx | 重新设置总页数 |
|setCurrentPage| xx | 重新设置当前选中页 |
|getCurrentPage|  | 获取当前页 |
|getToatalPage| |获取总页数 |
|goFirstPage| | 跳转到第一页|
|goLastPage| |跳转到最后一页 |
|goPreviewPage| |去上一页，当前页必须大于1才有上一页 |
|goNextPage| |去下一页，下一页必须小于总页数，或者是单纯的上一页下一页结构|
|skip| x |跳转到指定页 |
|disablePreviewPage|  | 让上一页的按钮变灰 |
|disableNextPage|  | 让下一页的按钮变灰 | 




         
         
       




