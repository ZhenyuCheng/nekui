### 示例
#### 基本形式

<div class="m-example"></div>

```xml
<datePicker />
<datePicker date="2008-08-08" />
```

#### 禁用组件

<div class="m-example"></div>

```xml
<datePicker disabled={true} />
```

#### 日期范围

<div class="m-example"></div>

```xml
<datePicker minDate={minDate} maxDate={maxDate} />
<datePicker minDate="2008-08-08" maxDate="2008-08-16" />
```

```javascript
var component = new RGUI.Component({
    template: template,
    data: {
        minDate: new Date(+new Date + 2*24*3600*1000),
        maxDate: new Date(+new Date + 7*24*3600*1000)
    }
});
```

#### 数据绑定

<div class="m-example"></div>

```xml
<datePicker date={date} />
<datePicker date={date} />
<p>当前选择的日期为：{date | format: 'yyyy-MM-dd'}</p>
```

#### 事件

请打开浏览器的控制台查看结果。

<div class="m-example"></div>

```xml
<datePicker
    on-select={this.log('on-select:', '$event.date:', $event.date)}
    on-change={this.log('on-change:', '$event.date:', $event.date)}
    on-toggle={this.log('on-toggle:', '$event.open:', $event.open)} />
```

```javascript
var component = new RGUI.Component({
    template: template,
    log: function() {
        console.log.apply(console, arguments);
    }
});
```