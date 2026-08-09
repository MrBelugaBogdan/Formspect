function utf8ToBase64(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
}

function generateFormspec(elements, canvasWidth, canvasHeight, version, bg) {
    let parts = [];
    
    // Версія і розмір ЗАВЖДИ перші
    parts.push(`formspec_version[${version}]`);
    parts.push(`size[${canvasWidth},${canvasHeight}]`);
    
    // Фон
    if (bg && bg.trim()) {
        if (bg.startsWith('#')) {
            parts.push(`bgcolor[${bg};false]`);
        } else {
            parts.push(`background[-0.5,-0.5;${parseFloat(canvasWidth)+1},${parseFloat(canvasHeight)+1};${bg};true]`);
        }
    }

    // Сортуємо за zIndex
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    
    for (const el of sorted) {
        const x = parseFloat(el.x) || 0;
        const y = parseFloat(el.y) || 0;
        const w = parseFloat(el.width) || 1;
        const h = parseFloat(el.height) || 1;
        
        switch (el.type) {
            case "label":
                parts.push(`label[${x},${y};${el.text || ""}]`);
                break;
                
            case "hypertext":
                parts.push(`hypertext[${x},${y};${w},${h};${el.name || 'title'};${el.text || ""}]`);
                break;
                
            case "button":
                parts.push(`button[${x},${y};${w},${h};${el.name};${el.label || ""}]`);
                break;
                
            case "button_exit":
                parts.push(`button_exit[${x},${y};${w},${h};${el.name};${el.label || ""}]`);
                break;
                
            case "image":
                parts.push(`image[${x},${y};${w},${h};${el.texture}]`);
                break;
                
            case "item_image_button":
                parts.push(`item_image_button[${x},${y};${w},${h};${el.item};${el.name};${el.label || ""}]`);
                break;
                
            case "box":
                parts.push(`box[${x},${y};${w},${h};${el.color || "#ffffff"}]`);
                break;
                
            case "field":
                parts.push(`field[${x},${y};${w},${h};${el.name};${el.label || ""};${el.default || ''}]`);
                break;
                
            case "textarea":
                parts.push(`textarea[${x},${y};${w},${h};${el.name};${el.label || ""};${el.default || ''}]`);
                break;
                
            case "dropdown":
                parts.push(`dropdown[${x},${y};${w},${h};${el.name};${el.choices};${el.selected || 1}]`);
                break;
                
            case "list":
                parts.push(`list[${el.inventory_location};${el.list_name};${x},${y};${el.columns},${el.rows};]`);
                break;
                
            case "playerlist":
                parts.push(`list[current_player;main;${x},${y};${el.columns},${el.rows};]`);
                break;
        }
    }
    
    return parts.join('');
}

function generateExportString(elements, canvasWidth, canvasHeight, version, bg, exportType, bookFields = {}) {
    const formspecStr = generateFormspec(elements, canvasWidth, canvasHeight, version, bg);

    if (exportType === 'raw') {
        return formspecStr;
    }
    
    const SOH = '\u0001';
    const STX = '\u0002';
    const ETX = '\u0003';
    
    if (exportType === 'book_empty') {
        return `/giveme books:empty 1 0 "${SOH}formspec${STX}${formspecStr}${ETX}"`;
    }
    
    if (exportType === 'book_written') {
        const owner = bookFields.owner || '';
        const description = bookFields.desc || '';
        const text = bookFields.text || '';
        const title = bookFields.title || '';
        
        const textB64 = utf8ToBase64(text);
        const titleB64 = utf8ToBase64(title);
        
        const data = 
            `${SOH}owner${STX}${owner}${ETX}` +
            `description${STX}${description}${ETX}` +
            `page${STX}1${ETX}` +
            `page_max${STX}1${ETX}` +
            `text_b64${STX}${textB64}${ETX}` +
            `title_b64${STX}${titleB64}${ETX}` +
            `formspec${STX}${formspecStr}${ETX}`;
        
        return `/giveme books:written 1 0 "${SOH}${data}"`;
    }
    
    return '';
}
