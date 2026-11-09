export default class Week {
    static getFirstMondayOfTheYear(year) {
        let newYearsDate = new Date(year, 0, 1);

        // start from Monday
        let offsetDays = 1;
        let newYearsDay = newYearsDate.getDay();
        if (newYearsDay != 0) {
            offsetDays += (7 - newYearsDay);
        }

        return new Date(year, 0, 1 + offsetDays);
    }

    static getMondayOfWeek(week, year = new Date().getFullYear()) {
        let firstMondayOfYear = Week.getFirstMondayOfTheYear(year);
        let thisMonday = new Date();
        thisMonday.setDate(firstMondayOfYear.getDate() + (week - 1) * 7);
        thisMonday.setHours(0, 0, 0, 0);
        return thisMonday;
    }

    static getTuesdayOfWeek(week, year = new Date().getFullYear()) {
        let thisTuesday = new Date();
        thisTuesday.setDate(Week.getMondayOfWeek(week, year).getDate() + 1);
        return thisTuesday;
    }

    // Ref: https://stackoverflow.com/questions/4156434/javascript-get-the-first-day-of-the-week-from-current-date#answer-4156516
    static getThisMonday(today = new Date()) {
        today = new Date(today);
        let day = today.getDay();
        let diff = today.getDate() - day + (day == 0 ? -6 : 1);
        today.setDate(diff);
        today.setHours(0, 0, 0, 0);
        return new Date(today);
    }

    static getThisWeek(today = new Date()) {
        let firstMonday = Week.getFirstMondayOfTheYear(today.getFullYear());
        let days = Math.ceil((today.valueOf() - firstMonday.valueOf()) / 86400000);

        // Count the first full week as 1 and the last as 52
        return Math.ceil(days / 7) + 1;
    };
}