// Типи елементів та їх властивості за замовчуванням
const ELEMENT_TYPES = [
    {
        type: "label",
        label: "Label",
        defaults: { x: 0.5, y: 0.5, width: 3, height: 0.8, text: "Текст" },
        props: ["x","y","width","height","text","color"],
        color: true
    },
    {
        type: "hypertext",
        label: "Hypertext",
        defaults: { x: 0.5, y: 1.5, width: 5, height: 1.5, text: "<global halign=center>Привіт</global>" },
        props: ["x","y","width","height","text"],
        color: false
    },
    {
        type: "button",
        label: "Button",
        defaults: { x: 1, y: 3, width: 4, height: 1, name: "btn_click", label: "Кнопка" },
        props: ["x","y","width","height","name","label"],
        color: false
    },
    {
        type: "button_exit",
        label: "Button Exit",
        defaults: { x: 1, y: 4.5, width: 4, height: 1, name: "btn_exit", label: "Вийти" },
        props: ["x","y","width","height","name","label"],
        color: false
    },
    {
        type: "image",
        label: "Image",
        defaults: { x: 0.5, y: 5, width: 2, height: 2, texture: "default_item_bg.png" },
        props: ["x","y","width","height","texture"],
        color: false
    },
    {
        type: "item_image_button",
        label: "Item Image Btn",
        defaults: { x: 1, y: 6, width: 2, height: 2, item: "default:diamond", name: "btn_item", label: "Купити" },
        props: ["x","y","width","height","item","name","label"],
        color: false
    },
    {
        type: "box",
        label: "Box",
        defaults: { x: 0.5, y: 7, width: 2, height: 0.3, color: "#0fc5f7" },
        props: ["x","y","width","height","color"],
        color: true
    },
    {
        type: "field",
        label: "Field",
        defaults: { x: 1, y: 8, width: 5, height: 1, name: "input", label: "Введіть:", default: "" },
        props: ["x","y","width","height","name","label","default"],
        color: false
    },
    {
        type: "textarea",
        label: "Textarea",
        defaults: { x: 1, y: 9.5, width: 5, height: 2, name: "textarea", label: "Опис:", default: "" },
        props: ["x","y","width","height","name","label","default"],
        color: false
    },
    {
        type: "dropdown",
        label: "Dropdown",
        defaults: { x: 1, y: 11, width: 4, height: 1, name: "dropdown", choices: "Один,Два,Три", selected: 1 },
        props: ["x","y","width","height","name","choices","selected"],
        color: false
    },
    {
        type: "list",
        label: "List (інвентар блоку)",
        defaults: { x: 0.5, y: 13, width: 9, height: 3, inventory_location: "nodemeta:17014 443 16012", list_name: "main", columns: 9, rows: 3 },
        props: ["x","y","width","height","inventory_location","list_name","columns","rows"],
        color: false
    },
    {
        type: "playerlist",
        label: "Player Inventory",
        defaults: { x: 0.5, y: 17, width: 8, height: 4, columns: 8, rows: 4 },
        props: ["x","y","width","height","columns","rows"],
        color: false
    }
];

// Створюємо унікальний id для нового елемента
function createElementData(typeObj) {
    return {
        id: 'el_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        type: typeObj.type,
        ...JSON.parse(JSON.stringify(typeObj.defaults)),
        zIndex: Date.now() % 10000  // умовний порядок
    };
}
