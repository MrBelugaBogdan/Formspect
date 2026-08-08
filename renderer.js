function generateFormspec(elements, canvasWidth, canvasHeight, version, bg) {
    let parts = [];
    parts.push(`formspec_version[${version}]`);
    parts.push(`size[${canvasWidth},${canvasHeight}]`);
    
    // Фон
    if (bg) {
        if (bg.startsWith('#')) {
            // Якщо колір – додаємо background з кольором (повне заповнення)
            parts.push(`bgcolor[${bg};false]`);
        } else {
            // Якщо текстура – використовуємо background з масштабуванням
            parts.push(`background[-0.5,-0.5;${canvasWidth+1},${canvasHeight+1};${bg};true]`);
        }
    }

    // Сортуємо за zIndex (чим більше, тим пізніше малюється, тобто вище)
    const sorted = [...elements].sort((a,b) => a.zIndex - b.zIndex);
    for (const el of sorted) {
        const x = el.x;
        const y = el.y;
        const w = el.width;
        const h = el.height;
        switch (el.type) {
            case "label":
                parts.push(`label[${x},${y};${el.text || ""}]`);
                break;
            case "hypertext":
                parts.push(`hypertext[${x},${y};${w},${h};${el.name || ''};${el.text || ""}]`);
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
                parts.push(`item_image_button[${x},${y};${w},${h};${el.item};${el.name};${el.label}]`);
                break;
            case "box":
                parts.push(`box[${x},${y};${w},${h};${el.color}]`);
                break;
            case "field":
                parts.push(`field[${x},${y};${w},${h};${el.name};${el.label};${el.default || ''}]`);
                break;
            case "textarea":
                parts.push(`textarea[${x},${y};${w},${h};${el.name};${el.label};${el.default || ''}]`);
                break;
            case "dropdown":
                parts.push(`dropdown[${x},${y};${w},${h};${el.name};${el.choices};${el.selected || 1}]`);
                break;
            case "list":
                parts.push(`list[${el.inventory_location};${el.list_name};${x},${y};${el.columns},${el.rows};]`);
                break;
        }
    }
    return parts.join('');
}
