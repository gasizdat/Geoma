/// <reference path="utils.ts" />

module Geoma.Tools
{
    import makeMod = Utils.makeMod;
    import toInt = Utils.toInt;
    import assert = Utils.assert;

    export type StringResource =
        "Создать" | "Создать точку" | "Создать отрезок..." | "Создать функцию..." |
        "Новый" | "Файл" | "Открыть" | "Сохранить..." | "Копировать" | "Удалить" | "Файла {0} больше нет" |
        "Введите имя документа" | "Постоянная ссылка на документ" | "Настройки" | "Тема" | "Светлая" | "Тёмная" |
        "Показать биссектрисы углов" | "Имя по умолчанию ({0})" | "Настраиваемое имя" | "Удалить индикатор угла {0}" |
        "Масштаб по осям x/y, %" | "Масштаб по осям x/y..." | "Редактировать функцию f = {0} ..." |
        "Редактировать функцию" | "Удалить координатную плоскость" |
        "Выберите вторую точку" | "Выберите вторую прямую" | "Выберите || прямую" | "Выберите ⟂ прямую" |
        "Невозможно восстановить данные" | "{0}\r\nВведите число" | "Значение '{0}' не является числом" |
        "Нельзя провести линию к той же точке!" | "Линия {0} уже проведена!" |
        "Угол может быть обозначен только между различными прямыми, имеющими одну общую точку." |
        "Угол между прямыми {0} и {1} уже обозначен." | "Отрезки {0} и {1} не содержат общих точек" |
        "Биссектриса угла {0} уже проведена." | "Отрезки {0} и {1} имеют общую точку и не могут стать ||." |
        "Отрезки {0} и {1} не имеют общей точки и не могут стать ⟂." | "Окружность {0} уже проведена!" |
        "Нельзя провести окружность к той же точке!" | "Удалить биссектрису" |
        "Добавить точку" | "Удалить окружность {0}" |
        "Обозначить угол..." | "Показать биссектрису угла..." | "Задать размер..." | "Введите размер в пикселях" |
        "Введен недопустимый размер {0}" | "Изменяемый размер" | "Фиксированный размер" | "Сделать ||..." | "Сделать ⟂..." |
        "Удалить прямую {0}" |
        "Точность..." | "Приращение аргумента x функции {0}" |
        "Создать отрезок..." | "Создать окружность из центра..." | "Создать окружность на диаметре..." | "Удалить точку" |
        "Выберите место";
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
            "Сохранить...": "Save...",
            "Файла {0} больше нет": "There is not exists file {0}",
            "Введите имя документа": "Please enter document name",
            "Постоянная ссылка на документ": "Permanent document link",
            "Настройки": "Settings",
            "Светлая": "Light theme",
            "Тёмная": "Dark theme",
            "Тема": "Theme",
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
            "Линия {0} уже проведена!": "Line segment is already exists.",
            "Угол может быть обозначен только между различными прямыми, имеющими одну общую точку.": "The angle can be set between two different lines segments with one common point.",
            "Угол между прямыми {0} и {1} уже обозначен.": "The angle is already exists between lines segments {0} and {1}.",
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
            "Сделать ||...": "Make it parallel...",
            "Сделать ⟂...": "Make it orthogonal...",
            "Удалить прямую {0}": "Delete the {0} line segment",
            "Приращение аргумента x функции {0}": "dx value of the function {0}",
            "Точность...": "Accuracy...",
            "Создать окружность из центра...": "Create a circle with point as center...",
            "Создать окружность на диаметре...": "Create a circle with point as one of diameter point...",
            "Удалить точку": "Delete point",
            "Выберите место": "Please select a starting location"
        }
    }
}