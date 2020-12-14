
export const capitalize = function (string) {
    return string.replace(/(?:^|\s)\S/g, function (a) {
        return a.toUpperCase();
    });
};

export const capitalizeEveryWord = function (string) {
    let capitalizedString = [];
    string.split(' ').forEach(x => {
        capitalizedString.push(capitalize(x.toLowerCase()));
    });
    return capitalizedString.join(' ');
};