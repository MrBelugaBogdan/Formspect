const ELEMENT_TYPES = [
    {
        type: "label",
        label: "📝 Label",
        defaults: { x: 0.5, y: 0.5, text: "Текст" },
        props: ["x", "y", "text"]
    },
    {
        type: "hypertext",
        label: "📖 Hypertext",
        defaults: { x: 0.5, y: 0.5, width: 7, height: 1, name: "title", text: "<global halign=center><b>МЕНЮ</b></global>" },
        props: ["x", "y", "width", "height", "name", "text"]
    },
    {
        type: "button",
        label: "🔘 Button",
        defaults: { x: 0.5, y: 2, width: 4, height: 1, name: "btn", label: "Кнопка" },
        props: ["x", "y", "width", "height", "name", "label"]
    },
    {
        type: "button_exit",
        label: "🚪 Exit Button",
        defaults: { x: 0.5, y: 3.5, width: 4, height: 1, name: "exit", label: "Вийти" },
        props: ["x", "y", "width", "height", "name", "label"]
    },
    {
        type: "image",
        label: "🖼️ Image",
        defaults: { x: 0.5, y: 5, width: 2, height: 2, texture: "default_item_bg.png" },
        props: ["x", "y", "width", "height", "texture"]
    },
    {
        type: "item_image_button",
        label: "💎 Item Button",
        defaults: { x: 1, y: 7, width: 1.5, height: 1.5, item: "default:diamond", name: "buy", label: "Купити" },
        props: ["x", "y", "width", "height", "item", "name", "label"]
    },
    {
        type: "box",
        label: "📦 Box",
        defaults: { x: 0.5, y: 1.8, width: 7, height: 0.05, color: "#0fc5f7" },
        props: ["x", "y", "width", "height", "color"]
    },
    {
        type: "field",
        label: "✏️ Field",
        defaults: { x: 1, y: 9, width: 5, height: 0.8, name: "input", label: "Введіть:", default: "" },
        props: ["x", "y", "width", "height", "name", "label", "default"]
    },
    {
        type: "textarea",
        label: "📄 Textarea",
        defaults: { x: 1, y: 10, width: 5, height: 2, name: "text", label: "Опис:", default: "" },
        props: ["x", "y", "width", "height", "name", "label", "default"]
    },
    {
        type: "dropdown",
        label: "📋 Dropdown",
        defaults: { x: 1, y: 12.5, width: 4, height: 1, name: "select", choices: "Один,Два,Три", selected: 1 },
        props: ["x", "y", "width", "height", "name", "choices", "selected"]
    },
    {
        type: "list",
        label: "📦 List (сундук)",
        defaults: { x: 0.25, y: 0.5, width: 9, height: 3, inventory_location: "nodemeta:17014 443 16012", list_name: "main", columns: 9, rows: 3 },
        props: ["x", "y", "width", "height", "inventory_location", "list_name", "columns", "rows"]
    },
    {
        type: "playerlist",
        label: "👤 Player Inv",
        defaults: { x: 0.25, y: 5.25, width: 8, height: 4, columns: 8, rows: 4 },
        props: ["x", "y", "width", "height", "columns", "rows"]
    }
];

function createElementData(typeObj) {
    return {
        id: 'el_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        type: typeObj.type,
        ...JSON.parse(JSON.stringify(typeObj.defaults)),
        zIndex: Date.now() % 10000
    };
}
