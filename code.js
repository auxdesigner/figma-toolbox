var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
figma.showUI(__html__, { height: 380, width: 320 });
let notificationHandler = null;
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
    if (figma.currentPage.selection.length === 0) {
        figma.notify("Target layers need to be selected first", { timeout: 2000 });
    }
    else {
        notificationHandler = figma.notify("Working...", { timeout: 60000 });
        setTimeout(function () {
            switch (msg.type) {
                case 'find':
                    findInstances();
                    break;
                case 'select':
                    selectLayers(msg);
                    break;
                case 'order':
                    orderNum(msg);
                    break;
                default:
                    replaceText(msg);
            }
        }, 100);
    }
    //figma.closePlugin();
};
function findInstances() {
    const result = [];
    // "layer" is the number of layers selected, not their sub layers
    for (const layer of figma.currentPage.selection) {
        traverseNode(layer, function (layer) {
            if (layer.type === 'INSTANCE' &&
                layer.mainComponent.remote === true) {
                result.push(layer);
            }
            ;
        });
    }
    figma.currentPage.selection = result;
    figma.viewport.scrollAndZoomIntoView(result);
    notificationHandler.cancel();
    noResultCheck(result);
}
function selectLayers(msg) {
    const result = [];
    // layer is the number of layers selected, not their sub layers
    for (const layer of figma.currentPage.selection) {
        traverseNode(layer, function (layer) {
            if (layer.name === msg.name) {
                result.push(layer);
            }
        });
    }
    figma.currentPage.selection = result;
    figma.viewport.scrollAndZoomIntoView(result);
    notificationHandler.cancel();
    noResultCheck(result);
}
function traverseNode(node, processNode) {
    if ('children' in node && node.visible === true) {
        for (const childNode of node.children) {
            traverseNode(childNode, processNode);
        }
    }
    processNode(node);
}
function replaceText(msg) {
    for (const layer of figma.currentPage.selection) {
        traverseNode(layer, function (layer) {
            return __awaiter(this, void 0, void 0, function* () {
                if (layer.type === "TEXT" && layer.visible === true) {
                    var font = null;
                    font = layer.fontName;
                    yield figma.loadFontAsync(font);
                    switch (msg.type) {
                        case 'random':
                            layer.characters = msg.string + '-' + randomNum();
                            break;
                        case 'num':
                            layer.characters = randomNum();
                            break;
                        case 'percentage':
                            layer.characters = randomPercentage();
                            break;
                        case 'base':
                            layer.characters = msg.string;
                            break;
                    }
                }
            });
        });
    }
    setTimeout(function () {
        notificationHandler.cancel();
    }, 100);
}
function orderNum(msg) {
    const textLayers = [];
    // "layer" is the number of layers selected, not their sub layers
    for (const layer of figma.currentPage.selection) {
        traverseNode(layer, function (layer) {
            if (layer.type === "TEXT" && layer.visible === true) {
                var font = null;
                font = layer.fontName;
                figma.loadFontAsync(font);
                textLayers.push(layer);
                layer.characters = msg.string + textLayers.length;
            }
        });
    }
    setTimeout(function () {
        notificationHandler.cancel();
    }, 100);
}
function randomNum() {
    return (Math.random() * (999 - 100) + 100).toFixed(0).toString();
}
function randomPercentage() {
    return (Math.random() * 100).toFixed(1) + '%';
}
function noResultCheck(result) {
    if (result.length === 0) {
        figma.notify("No results found", { timeout: 2000 });
    }
}
