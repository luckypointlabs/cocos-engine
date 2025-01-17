/*
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2023 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

import { ccclass, serializable, editable, tooltip } from 'cc.decorator';
import { cclegacy } from '@base/global';
import type { Node } from './node';

/**
 * @en
 * The EventHandler class sets the event callback in the scene.
 * This class allows the user to set the callback target node, target component name, component method name, and call the target method through the `emit` method.
 * @zh
 * “EventHandler” 类用来设置场景中的事件回调，该类允许用户设置回调目标节点，目标组件名，组件方法名，并可通过 emit 方法调用目标函数。
 *
 * @example
 * ```ts
 * // Let's say we have a MainMenu component on newTarget
 * // file: MainMenu.ts
 * @ccclass('MainMenu')
 * export class MainMenu extends Component {
 *     // sender: the node MainMenu.ts belongs to
 *     // eventType: CustomEventData
 *     onClick (sender, eventType) {
 *         cc.log('click');
 *     }
 * }
 *
 * import { Component } from 'cc';
 * const eventHandler = new Component.EventHandler();
 * eventHandler.target = newTarget;
 * eventHandler.component = "MainMenu";
 * eventHandler.handler = "OnClick";
 * eventHandler.customEventData = "my data";
 * ```
 */
@ccclass('cc.ClickEvent')
export class EventHandler {
    /**
     * @deprecated since v3.5.0, this is an engine private interface that will be removed in the future.
     */
    get _componentName (): any {
        this._genCompIdIfNeeded();

        return this._compId2Name(this._componentId);
    }
    set _componentName (value) {
        this._componentId = this._compName2Id(value);
    }

    /**
     * @en
     * Dispatching component events.
     * @zh
     * 组件事件派发。
     *
     * @param events - The event list to be emitted
     * @param args - The callback arguments
     */
    public static emitEvents (events: EventHandler[], ...args: any[]): void {
        for (let i = 0, l = events.length; i < l; i++) {
            const event = events[i];
            if (!(event instanceof EventHandler)) {
                continue;
            }

            event.emit(args);
        }
    }
    /**
     * @en
     * The node that contains target component
     * @zh
     * 事件响应组件和函数所在节点
     */
    // @type(Node) should be removed for avoid circle reference error
    // the type definition of it deal with in the file './component-event-handler.schema.ts'
    @serializable
    @tooltip('i18n:button.click_event.target')
    public target: Node | null = null;
    /**
     * @en
     * The name of the component(script) that contains target callback, such as the name 'MainMenu' of the script in the example
     * @zh
     * 事件响应函数所在组件名（脚本名）, 比如例子中的脚本名 'MainMenu'
     */
    // only for deserializing old project component field
    @serializable
    @editable
    @tooltip('i18n:button.click_event.component')
    public component = '';

    /**
     * @deprecated since v3.5.0, this is an engine private interface that will be removed in the future.
     */
    @serializable
    public _componentId = '';

    /**
     * @en
     * Event handler, such as the callback function name 'onClick' in the example
     * @zh
     * 响应事件函数名，比如例子中的 'onClick' 方法名
     */
    @serializable
    @editable
    @tooltip('i18n:button.click_event.handler')
    public handler = '';

    /**
     * @en
     * Custom Event Data
     * @zh
     * 自定义事件数据
     */
    @serializable
    @editable
    @tooltip('i18n:button.click_event.customEventData')
    public customEventData = '';

    /**
     * @en Trigger the target callback with given arguments
     * @zh 触发目标组件上的指定 handler 函数，可以选择传递参数。
     * @param params - The arguments for invoking the callback
     * @example
     * ```ts
     * import { Component } from 'cc';
     * const eventHandler = new Component.EventHandler();
     * eventHandler.target = newTarget;
     * eventHandler.component = "MainMenu";
     * eventHandler.handler = "OnClick"
     * eventHandler.emit(["param1", "param2", ....]);
     * ```
     */
    public emit (params: any[]): void {
        const target = this.target;
        if (!cclegacy.isValid(target)) { return; }

        this._genCompIdIfNeeded();
        const compType = cclegacy.js.getClassById(this._componentId);

        const comp = target!.getComponent(compType);
        if (!cclegacy.isValid(comp)) { return; }

        const handler = comp![this.handler];
        if (typeof (handler) !== 'function') { return; }

        if (this.customEventData != null && this.customEventData !== '') {
            params = params.slice();
            params.push(this.customEventData);
        }

        handler.apply(comp, params);
    }

    private _compName2Id (compName): any {
        const comp = cclegacy.js.getClassByName(compName);
        return cclegacy.js.getClassId(comp);
    }

    private _compId2Name (compId): any {
        const comp = cclegacy.js.getClassById(compId);
        return cclegacy.js.getClassName(comp);
    }

    // to be deprecated in the future
    private _genCompIdIfNeeded (): void {
        if (!this._componentId) {
            this._componentName = this.component;
            this.component = '';
        }
    }
}
