/// <reference path="utils.ts" />

module Geoma.Tools
{
    export type StringResource =
        "Создать" | "Создать точку" | "Создать отрезок..." | "Создать функцию..." | "Создать линию..." |
        "Новый" | "Файл" | "Открыть" | "Сохранить" | "Сохранить как..." | "Копировать" | "Удалить" | "Файла {0} больше нет" |
        "Введите имя документа" | "Постоянная ссылка на документ" | "Настройки" | "Тема" | "Светлая" | "Тёмная" | "Свойства" |
        "Показать биссектрисы углов" | "Имя по умолчанию ({0})" | "Настраиваемое имя" | "Удалить индикатор угла {0}" |
        "Масштаб по осям x/y, %" | "Масштаб по осям x/y..." | "Редактировать функцию f = {0} ..." |
        "Редактировать функцию" | "Удалить координатную плоскость" |
        "Выберите вторую точку" | "Выберите вторую прямую" | "Выберите || прямую" | "Выберите ⟂ прямую" |
        "Невозможно восстановить данные" | "{0}\r\nВведите число" | "Значение '{0}' не является числом" |
        "Нельзя провести линию к той же точке!" | "Отрезок {0} уже проведен!" | "Линия {0} уже проведена!" |
        "Угол может быть обозначен только между различными прямыми, имеющими одну общую точку." |
        "Угол {0} уже обозначен." | "Отрезки {0} и {1} не содержат общих точек" |
        "Биссектриса угла {0} уже проведена." | "Отрезки {0} и {1} имеют общую точку и не могут стать ||." |
        "Отрезки {0} и {1} не имеют общей точки и не могут стать ⟂." | "Окружность {0} уже проведена!" |
        "Нельзя провести окружность к той же точке!" | "Удалить биссектрису" |
        "Добавить точку" | "Удалить окружность {0}" |
        "Обозначить угол..." | "Показать биссектрису угла..." | "Задать размер..." | "Введите размер в пикселях" |
        "Введен недопустимый размер {0}" | "Изменяемый размер" | "Фиксированный размер" | "Сделать ||..." | "Сделать ⟂..." |
        "Удалить отрезок {0}" | "Удалить линию {0}" | "Удалить график {0}" |
        "Точность..." | "Приращение аргумента x функции {0}" |
        "Создать отрезок..." | "Создать окружность из центра..." | "Создать окружность на диаметре..." | "Удалить точку" |
        "Выберите место" |
        "Отмена" | "Повтор" | "Перемещение точки {0}" | "Удаление точки {0}" | "Добавление точки" |
        "Перемещение сегмента {0}" | "Удаление сегмента {0}" | "Удаление линии {0}" | "Добавление сегмента" |
        "Название угла ({0})" | "Отобразить угол" |
        "Добавление окружности" | "Перемещение окружности {0}" |
        "Добавление линии" | "Перемещение линии {0}" |
        "Сделать ||" | "Сделать ⟂" |
        "Добавление функции" | "Перемещение функции {0}" | "Масштабирование функции {0}" | "Редактирование функции {0}" |
        "Масштабирование осей" | "Автоматическое сохранение" | "Перемещение страницы" |
        "Точка({0}: x={1}; y={2})" |
        "Отрезок({0}: l={1}; α={2}°)" |
        "Линия({0}: α={1}°)" |
        "Окружность({0}: Ø={1})" |
        "Функция(f={0})" |
        "Угол({0}: {1}={2}°)" |
        "Установить {0} = {1}" |
        "Ошибка выражения: {0}" |
        "Неподдерживаемый тип функции: {0}" |
        "Неподдерживаемый тип оператора: {0}" |
        "Неподдерживаемый тип операнда: {0}" |
        "Введите выражение" |
        "⌨⇆🖰" |
        "Формула производной...";

    export enum UiLanguage
    {
        ruRu,
        enUs
    }

    export abstract class Resources
    {
        public static language: UiLanguage = UiLanguage.ruRu;

        public static collator(): Intl.Collator
        {
            switch (Resources.language)
            {
                case UiLanguage.enUs:
                    return new Intl.Collator("en-US", { numeric: true });
                case UiLanguage.ruRu:
                    return new Intl.Collator("ru-RU", { numeric: true });
            }
        }

        public static string(resource_id: StringResource, ...args: string[]): string
        {
            switch (Resources.language)
            {
                case UiLanguage.enUs:
                    return Utils.formatString(Resources.enEnStrings[resource_id] ?? resource_id, ...args);
                case UiLanguage.ruRu:
                    return Utils.formatString(resource_id, ...args);
            }
        }

        private static enEnStrings: Record<StringResource, string> = {
            "Создать": "Create",
            "Создать точку": "Create a point",
            "Создать отрезок...": "Create a line segment...",
            "Создать функцию...": "Create a function graph...",
            "Файл": "File",
            "Новый": "New",
            "Открыть": "Open",
            "Копировать": "Copy",
            "Удалить": "Delete",
            "Сохранить": "Save",
            "Сохранить как...": "Save as...",
            "Файла {0} больше нет": "There is not exists file {0}",
            "Введите имя документа": "Please enter document name",
            "Постоянная ссылка на документ": "Permanent document link",
            "Настройки": "Settings",
            "Светлая": "Light theme",
            "Тёмная": "Dark theme",
            "Тема": "Theme",
            "Свойства": "Properties",
            "Показать биссектрисы углов": "Show angles bisectors",
            "Имя по умолчанию ({0})": "Set default name ({0})",
            "Настраиваемое имя": "Custom name",
            "Удалить индикатор угла {0}": "Delete angle indicator",
            "Масштаб по осям x/y, %": "Scale by x/y axes (%)",
            "Масштаб по осям x/y...": "Scale by x/y axes...",
            "Редактировать функцию f = {0} ...": "Edit function f = {0} ...",
            "Редактировать функцию": "Edit function",
            "Удалить координатную плоскость": "Delete coordinate plane",
            "Выберите вторую точку": "Please select second point",
            "Выберите вторую прямую": "Please select second line segment",
            "Выберите || прямую": "Please select line segment to be parallel",
            "Выберите ⟂ прямую": "Please select line segment to be orthogonal",
            "Невозможно восстановить данные": "Unable to restore document data",
            "{0}\r\nВведите число": "{0}\r\nPlease, enter a number",
            "Значение '{0}' не является числом": "The '{0}' is not a number",
            "Нельзя провести линию к той же точке!": "Unable to make line segment with one point.",
            "Отрезок {0} уже проведен!": "Line segment {0} is already exists.",
            "Угол может быть обозначен только между различными прямыми, имеющими одну общую точку.": "The angle can be set between two different lines segments with one common point.",
            "Угол {0} уже обозначен.": "The {0} angle is already exists.",
            "Отрезки {0} и {1} не содержат общих точек": "The {0} and {1} lines segments have not common points.",
            "Биссектриса угла {0} уже проведена.": "Bisector of {0} angle is already exists.",
            "Отрезки {0} и {1} имеют общую точку и не могут стать ||.": "The {0} and {1} lines segments have one common point and cannot be parallel.",
            "Отрезки {0} и {1} не имеют общей точки и не могут стать ⟂.": "The {0} and {1} lines segments have not common points and cannot by orthogonal.",
            "Окружность {0} уже проведена!": "The {0} circle is already exists.",
            "Нельзя провести окружность к той же точке!": "Unable to make circle containing one point.",
            "Удалить биссектрису": "Delete angle bisector",
            "Добавить точку": "Add point",
            "Удалить окружность {0}": "Delete {0} circle",
            "Введен недопустимый размер {0}": "The value {0} is the invalid size",
            "Введите размер в пикселях": "Please enter the size in pixels",
            "Задать размер...": "Set the size...",
            "Изменяемый размер": "Resizable",
            "Фиксированный размер": "Fixed size",
            "Обозначить угол...": "Add the angle indicator...",
            "Показать биссектрису угла...": "Add the angle bisector...",
            "Сделать ||...": "Make it parallel to...",
            "Сделать ⟂...": "Make it orthogonal to...",
            "Удалить отрезок {0}": "Delete the {0} line segment",
            "Приращение аргумента x функции {0}": "dx value of the function {0}",
            "Точность...": "Accuracy...",
            "Создать окружность из центра...": "Create a circle with point as center...",
            "Создать окружность на диаметре...": "Create a circle with point as one of diameter point...",
            "Удалить точку": "Delete point",
            "Выберите место": "Please select a starting location",
            "Создать линию...": "Create a line...",
            "Линия {0} уже проведена!": "Line {0} is already exists.",
            "Удалить линию {0}": "Delete the {0} line ",
            "Удалить график {0}": "Delete the {0} function graph",
            "Отмена": "Undo",
            "Повтор": "Redo",
            "Перемещение точки {0}": "Moving of the {0} point",
            "Удаление точки {0}": "Delete the {0} point",
            "Добавление точки": "Add a point",
            "Перемещение сегмента {0}": "Moving of the {0} line segment",
            "Удаление сегмента {0}": "Delete the {0} line segment",
            "Удаление линии {0}": "Delete the {0} line",
            "Добавление сегмента": "Add a line segment",
            "Название угла ({0})": "Angle name ({0})",
            "Отобразить угол": "Show angle",
            "Добавление окружности": "Add a circle",
            "Перемещение окружности {0}": "Moving of the {0} circle",
            "Добавление линии": "Add a line",
            "Перемещение линии {0}": "Moving of the {0} line",
            "Сделать ||": "Make parallel",
            "Сделать ⟂": "Make orthogonal",
            "Добавление функции": "Add a function graph",
            "Перемещение функции {0}": "Moving of the {0} function graph",
            "Масштабирование функции {0}": "Scaling of the {0} function graph",
            "Редактирование функции {0}": "Editing of the {0} function grapth",
            "Масштабирование осей": "Scaling of the axes",
            "Автоматическое сохранение": "Autosave",
            "Перемещение страницы": "Moving of the canvas",
            "Точка({0}: x={1}; y={2})": "Point({0}: x={1}; y={2})",
            "Отрезок({0}: l={1}; α={2}°)": "Segment({0}: l={1}; α={2}°)",
            "Линия({0}: α={1}°)": "Line({0}: α={1}°)",
            "Окружность({0}: Ø={1})": "Circle({0}: Ø={1})",
            "Функция(f={0})": "Function(f={0})",
            "Угол({0}: {1}={2}°)": "Angle({0}: {1}={2}°)",
            "Установить {0} = {1}": "Set {0} = {1}",
            "Ошибка выражения: {0}": "Error expression: {0}",
            "Неподдерживаемый тип функции: {0}": "Unsupported function type: {0}",
            "Неподдерживаемый тип оператора: {0}": "Unsupported operator type: {0}",
            "Неподдерживаемый тип операнда: {0}": "Unsupported operand type: {0}",
            "Введите выражение": "Enter a math expression",
            "⌨⇆🖰": "⌨⇆🖰",
            "Формула производной...": "Show derivative expression..."
        }
    }
}