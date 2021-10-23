/*jslint browser: true*/
/*global m13n */

if (window.m13n === undefined) {
    window.m13n = {};
}

m13n.util = (function () {
    "use strict";

    return {
        //
        // QUERYSTRING JSON OBJECT
        //
        urlParams: (function () {
            /*jslint regexp: true*/
            var match,
                pl     = /\+/g,  // Regex for replacing addition symbol with a space
                search = /([^&=]+)=?([^&]*)/g,
                decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
                query  = window.location.search.substring(1),
                p      = {};
            /*jslint regexp: false*/

            while (true) {
                match = search.exec(query);
                if (!match) {
                    break;
                }
                p[decode(match[1])] = decode(match[2]);
            }

            return p;
        }()),

        nvl: function (val, def) {
            return val !== undefined ? val : def;
        },

        requires: function (module) {
            if (m13n[module] === undefined) {
                throw "M13n: " + module + " is missing.";
            }
        }
    };
}());
/*jslint browser: true*/
/*global m13n */

if (window.m13n === undefined) {
    window.m13n = {};
}

//
// GAME CONSTANTS (configurable values for game tuning purposes)
//
m13n.consts = (function (util) {
    "use strict";
    var c = {
        containerSelector: "#main",
        startCash: 0,
        startSize: 1.0,
        startFloor: 0.95,
        shipSize: 10.0,
        unitPriceStart: 0.1,
        defaultCooldown: 250,
        salesTeamCooldown: 5000,
        salesTeamCooldownScale: 1.25,
        salesTeamSynergyStep: 50,
        salesHireCost: 25,
        salesHireCostScale: 0.26,
        engineerCost: 1,
        engineerRate: 0.95,
        engineerCostScale: 12,
        engineerTeamCooldown: 1000,
        engineerTeamCooldownScale: 1.5,
        engineerHireCost: 10000,
        engineerHireCostScale: 0.75,
        researchCost: 10,
        researchRate: 0.95,
        researchCostScale: 12,
        researchTeamCooldown: 30000,
        researchTeamCooldownScale: 1.5,
        researchHireCost: 100000,
        researchHireCostScale: 1.1,
        resetCost: 1e+18,

        imageSales: "cashWhite.png",
        imageEngineer: "wrenchWhite.png",
        imageResearch: "beakerWhite.png",
        imageSalesperson: "salespersonWhite.png",
        imageEngineerperson: "engineerWhite.png",
        imageResearcher: "scientistWhite.png",
        imageQuestion: "questionWhite.png",
        imageWrenchBleeding: "wrenchBleedingWhite.png",
        imageThinking: "thinkingWhite.png",
        imageReset: "resetWhite.png",

        enableSaveData: true,
        enableLoadData: true,
        saveInterval: 30000,
        minTickLength: 30,
        maxTickLength: 60000
    };

    // use test data
    if (util.urlParams.icheet === "freebies") {
        c.enableSaveData = false;
        c.enableLoadData = false;
        c.salesHireCost = 0;
        c.engineerCost = 0;
        c.engineerHireCost = 0;
        c.researchCost = 0;
        c.researchHireCost = 0;
        c.resetCost = 0;
        return c;
    }

    //force reset
    if (util.urlParams.reset === "reset") {
        c.enableLoadData = false;
    }

    return c;
}(m13n.util));
/*jslint browser: true*/
/*global m13n */

if (window.m13n === undefined) {
    window.m13n = {};
}

//
// CONVERTING UNITS TO STRINGS
//
m13n.format = (function () {
    "use strict";

    var factors = [
            {value: 0,   prefix: "",       name: ""},
            {value: -1,  prefix: "d",      name: "deci"},
            {value: -2,  prefix: "c",      name: "centi"},
            {value: -3,  prefix: "m",      name: "milli"},
            {value: -6,  prefix: "\u03BC", name: "micro"},
            {value: -9,  prefix: "n",      name: "nano"},
            {value: -12, prefix: "p",      name: "pico"},
            {value: -15, prefix: "f",      name: "femto"},
            {value: -18, prefix: "a",      name: "atto"},
            {value: -21, prefix: "z",      name: "zepto"},
            {value: -24, prefix: "y",      name: "yocto"}
        ],
        moneyFactors = [
            {value: 63,  name: "vigintillion"},
            {value: 60,  name: "novemdecillion"},
            {value: 57,  name: "octodecillion"},
            {value: 54,  name: "septendecillion"},
            {value: 51,  name: "sexdecillion"},
            {value: 48,  name: "quindecillion"},
            {value: 45,  name: "quattuordecillion"},
            {value: 42,  name: "tredecillion"},
            {value: 39,  name: "duodecillion"},
            {value: 36,  name: "undecillion"},
            {value: 33,  name: "decillion"},
            {value: 30,  name: "nonillion"},
            {value: 27,  name: "octillion"},
            {value: 24,  name: "septillion"},
            {value: 21,  name: "sextillion"},
            {value: 18,  name: "quintillion"},
            {value: 15,  name: "quadrillion"},
            {value: 12,  name: "trillion"},
            {value: 9,   name: "billion"},
            {value: 0,   name: ""}
        ];

    function scaleByFactor(number, factor) {
        var scale = Math.pow(10, factor.value);
        return number / scale;
    }

    function selectFactor(factors, number) {
        function factorCheck(i) {
            var scale = Math.pow(10, factors[i].value),
                last = (i === factors.length - 1);
            return number >= scale || last;
        }

        var i;
        for (i = 0; i < factors.length; i += 1) {
            if (factorCheck(i) === true) {
                return factors[i];
            }
        }
    }

    return {
        displaySize: function (number) {
            function abbrevFor(factor) {
                return factor.prefix + "m diameter";
            }

            var factor = selectFactor(factors, number),
                scaledNumber = scaleByFactor(number, factor),
                unit = abbrevFor(factor),
                valueText;
            if (factor === factors[factors.length - 1]) {
                valueText = scaledNumber;
            } else if (factor.value === 0) {
                valueText = scaledNumber.toFixed(1);
            } else {
                valueText = scaledNumber.toFixed(4);
            }

            return valueText + " " + unit;
        },

        displayCount: function (number, decimalPlaces) {
            function addCommas(number, decimals) {
                var fixed = (decimals !== undefined
                    ? number.toFixed(decimals)
                    : number),
                    numString = fixed.toString(),
                    parts = numString.split("."),
                    left = parts[0],
                    outString = "",
                    count = 0,
                    i;
                for (i = left.length - 1; i >= 0; i -= 1) {
                    if (count === 3) {
                        outString = "," + outString;
                        count = 0;
                    }

                    outString = left.substring(i, i + 1) + outString;
                    count += 1;
                }

                if (parts.length > 1) {
                    outString += "." + parts[1];
                }

                return outString;
            }

            var factor = selectFactor(moneyFactors, number),
                scaledNumber = scaleByFactor(number, factor),
                valueText,
                dp = (factor === moneyFactors[moneyFactors.length - 1]
                    ? decimalPlaces
                    : 3);
            valueText = addCommas(scaledNumber, dp);

            //if (factor === moneyFactors[moneyFactors.length - 1]) {
            //    valueText = addCommas(scaledNumber, decimalPlaces);
            //} else {
            //    valueText = scaledNumber.toFixed(3);
            //}

            return valueText + (factor.name !== "" ? " " + factor.name : "");
        },

        displayCash: function (number, decimalPlaces) {
            if (decimalPlaces === undefined) {
                decimalPlaces = 2;
            }
            return "$" + m13n.format.displayCount(number, decimalPlaces);
        },

        displayPercent: function (number) {
            return (number * 100).toFixed(2) + "%";
        },

        displayCuMeters: function (number) {
            return number + " m<sup>3</sup>";
        }
    };
}());
/*jslint browser: true*/
/*global m13n */

if (window.m13n === undefined) {
    window.m13n = {};
}

//
// GAME DATA, SAVING AND LOADING
//
m13n.data = (function (util, consts) {
    "use strict";

    var GAME_DATA_LOCALSTORAGE = 'gameData';

    function achievementsToGameData(achievements) {
        function setGdAch(gdAch, i) {
            var ach = achievements[i];
            gdAch[achievements[i].id] = ach.achieved;
        }
        var gdAch = {},
            i;
        for (i = 0; i < achievements.length; i += 1) {
            setGdAch(gdAch, i);
        }
        return gdAch;
    }

    function setAchievementsFromGameData(achievements, gameData) {
        if (gameData.achievements === undefined) {
            return;
        }
        var i;
        for (i = 0; i < achievements.length; i += 1) {
            achievements[i].achieved =
                gameData.achievements[achievements[i].id];
        }
    }

    return {
        newGameData: function () {
            return {
                cash: consts.startCash,
                size: consts.startSize,
                floor: consts.startFloor,
                shipSize: consts.shipSize,

                sTeamSize: {
                    current: 0,
                    max: 0
                },
                sTeamProgress: 0,
                eTeamSize: {
                    current: 0,
                    max: 0
                },
                eTeamProgress: 0,
                rTeamSize: {
                    current: 0,
                    max: 0
                },
                rTeamProgress: 0,
                dummyAuto: {
                    current: 0,
                    max: 0
                },
                dummyManual: {
                    current: 1,
                    max: 1
                },

                achievements: {},

                lastSave: Date.now(),
                sessionCash: 0,
                lifetimeCash: 0,
                resets: 0,
                engineerRate: consts.engineerRate,
                researchRate: consts.researchRate
            };
        },

        save: function (gameData, achievements) {
            gameData.achievements = achievementsToGameData(achievements);
            gameData.lastSave = Date.now();
            if (!consts.enableSaveData) {
                return;
            }
            var jsonString = JSON.stringify(gameData);
            localStorage.setItem(GAME_DATA_LOCALSTORAGE, jsonString);
        },

        load: function () {
            if (!consts.enableLoadData) {
                return null;
            }
            var jsonString = localStorage.getItem(GAME_DATA_LOCALSTORAGE),
                jsonData = JSON.parse(jsonString);
            return jsonData;
        },

        overlayGameData: function (current, achievements, loaded) {
            current.cash = util.nvl(loaded.cash, current.cash);
            current.size = util.nvl(loaded.size, current.size);
            current.floor = util.nvl(loaded.floor, current.floor);

            current.sTeamSize =
                util.nvl(loaded.sTeamSize, current.sTeamSize);
            current.sTeamProgress =
                util.nvl(loaded.sTeamProgress, current.sTeamProgress);

            current.eTeamSize =
                util.nvl(loaded.eTeamSize, current.eTeamSize);
            current.eTeamProgress =
                util.nvl(loaded.eTeamProgress, current.eTeamProgress);

            current.rTeamSize =
                util.nvl(loaded.rTeamSize, current.rTeamSize);
            current.rTeamProgress =
                util.nvl(loaded.rTeamProgress, current.rTeamProgress);

            current.lastSave =
                util.nvl(loaded.lastSave, current.lastSave);
            current.sessionCash =
                util.nvl(loaded.sessionCash, current.cash);
            current.lifetimeCash =
                util.nvl(loaded.lifetimeCash, current.lifetimeCash);
            current.resets = util.nvl(loaded.resets, current.resets);

            current.engineerRate =
                util.nvl(loaded.engineerRate, current.engineerRate);
            current.researchRate =
                util.nvl(loaded.researchRate, current.researchRate);

            setAchievementsFromGameData(achievements, loaded);
        }
    };
}(m13n.util, m13n.consts));
/*jslint browser: true*/
/*global m13n, kongregateAPI, kongregate */

// load kongregate API or fall back...
(function () {
    'use strict';
    function stubReason() {
        if (window.location.href.lastIndexOf('file://', 0) === 0) {
            return "Using stub for Kongregate API because running locally.";
        }
        if (window.kongregateAPI === undefined) {
            return "Kongregate API not found; using stub.";
        }
        return null;
    }
    var reason = stubReason();
    if (reason !== null) {
        console.warn(reason);
        window.kongregate = {
            stats: {
                submit: function (name, value) {
                    console.log(
                        "Kongregate API stub: Submitted " + name + " = " + value
                    );
                }
            }
        };
    } else {
        console.log("Getting Kongregate API...");
        kongregateAPI.loadAPI(function () {
            window.kongregate = kongregateAPI.getAPI();
            console.log("Kongregate API loaded.");
        });
    }
}());

if (window.m13n === undefined) {
    window.m13n = {};
}

m13n.integration = (function () {
    'use strict';
    function getMagnitude(value) {
        var scaled = value,
            orders = 0;
        while (scaled < 1 && scaled !== 0) {
            scaled *= 10;
            orders += 1;
        }
        return orders;
    }
    function safeStatSubmit(name, value) {
        if (kongregate !== undefined) {
            kongregate.stats.submit(name, value);
        } else {
            console.warn("'kongregate' is undefined. Stat not submitted.");
        }
    }
    return {
        submitAll: function (gameData, achievements) {
            var achievementCount =
                achievements.reduce(function (sum, current) {
                    return sum + (current.achieved === true ? 1 : 0);
                }, 0);
            m13n.integration.submitAchievementCount(achievementCount);
            m13n.integration.submitSize(gameData.size);
        },
        submitAchievementCount: function (n) {
            safeStatSubmit("AchievementsEarned", n);
        },
        submitSize: function (n) {
            var magnitude = getMagnitude(n);
            safeStatSubmit("SizeMagnitude", magnitude);
        }
    };
}());
/*jslint browser: true*/
/*global m13n */

if (window.m13n === undefined) {
    window.m13n = {};
}

//
// ACHIEVEMENTS
//
m13n.achievements = (function (consts, format) {
    "use strict";
    var achievements;

    function getAch(id) {
        var i;
        for (i = 0; i < achievements.length; i += 1) {
            if (achievements[i].id === id) {
                return achievements[i];
            }
        }
    }

    function earnedPreviousAch(id) {
        var prev = getAch(id - 1);
        return prev === undefined || prev.achieved === true;
    }

    achievements = (function () {
        function sAch(id, cash, name) {
            return {
                id: id,
                name: name,
                desc: "Earn " + format.displayCash(cash),
                func: function (gameData) {
                    return gameData.lifetimeCash >= cash;
                },
                img: consts.imageSales,
                hide: function () {
                    return !earnedPreviousAch(id);
                }
            };
        }
        function eAch(id, size, name) {
            return {
                id: id,
                name: name,
                desc: "Make it smaller than " + format.displaySize(size),
                func: function (gameData) {
                    return gameData.size < size;
                },
                img: consts.imageEngineer,
                hide: function () {
                    return !earnedPreviousAch(id);
                }
            };
        }
        function rAch(id, floor, name) {
            return {
                id: id,
                name: name,
                desc: "Discover a theoretical size smaller than " +
                    format.displaySize(floor),
                func: function (gameData) {
                    return gameData.floor < floor;
                },
                img: consts.imageResearch,
                hide: function () {
                    return !earnedPreviousAch(id);
                }
            };
        }
        function sTeamAch(id, teamsize, name) {
            var syn = consts.salesTeamSynergyStep;
            return {
                id: id,
                name: name,
                desc: "Hire " + teamsize +
                    " sales" + (teamsize === 1 ? "person" : "people") + "." +
                    (teamsize === syn
                        ? " Your team will receive a synergy bonus for every " + syn + " members."
                        : ""),
                func: function (gameData) {
                    return gameData.sTeamSize.max >= teamsize;
                },
                img: consts.imageSalesperson,
                hide: function () {
                    return !earnedPreviousAch(id);
                }
            };
        }
        function eTeamAch(id, teamsize, name) {
            return {
                id: id,
                name: name,
                desc: "Hire " + teamsize +
                    " engineer" + (teamsize === 1 ? "" : "s") + ".",
                func: function (gameData) {
                    return gameData.eTeamSize.max >= teamsize;
                },
                img: consts.imageEngineerperson,
                hide: function () {
                    return !earnedPreviousAch(id);
                }
            };
        }
        function rTeamAch(id, teamsize, name) {
            return {
                id: id,
                name: name,
                desc: "Hire " + teamsize +
                    " researcher" + (teamsize === 1 ? "" : "s") + ".",
                func: function (gameData) {
                    return gameData.rTeamSize.max >= teamsize;
                },
                img: consts.imageResearcher,
                hide: function () {
                    return !earnedPreviousAch(id);
                }
            };
        }
        return [
            // Sales achievements
            sAch(1, 1, "Your first dollar"),
            sAch(2, 11000, "Eleven Thousand-aire"),
            sAch(3, 1e+6, "1960s Bond Villain"),
            sAch(4, 1e+9, "The financial elite"),
            sAch(5, 1e+11, "Gil Bates"),
            sAch(6, 7.6e+13, "Worldwide GDP"),
            sAch(7, 1e+17, "Unobtillian dollars"),
            sAch(8, 1e+21, "Out-cashed the world"),
            sAch(9, 1e+24, "Feeling AdVenturous yet?"),

            // Engineering achievements
            eAch(100, consts.startSize, "First shrink"),
            eAch(101, 1e-1, "Whacked it good"),
            eAch(102, 1e-2, "Delicious coffee bean"),
            eAch(103, 1e-3, "Like a grain of salt"),
            eAch(104, 1e-4, "Just barely visible to the naked eye"),
            eAch(105, 1e-5, "White blood cell"),
            eAch(106, 1e-6, "Smaller than a chromosome"),
            eAch(107, 1e-7, "Invisible to an optical microscope"),
            eAch(108, 1e-8, "Gone viral"),
            eAch(109, 1e-9, "Little carbon balls"),
            eAch(110, 1e-10, "Uh oh"),
            eAch(111, 1e-11, "Cleanup on Isle Four"),
            eAch(112, 1e-12, "Making the Leap"),
            eAch(113, 1e-13, "90% filler"),
            eAch(114, 1e-14, "It's subatomic"),
            eAch(115, 1e-15, "Apply what you know"),
            eAch(116, 1e-16, "Attoscopic seamstress"),
            eAch(117, 1e-17, "Weak force, dude"),
            eAch(118, 1e-18, "Quarky"),
            eAch(119, 1e-19, "Now it's just getting silly"),
            eAch(120, 1e-20, "Getting by with a little help from your friends"),
            eAch(121, 1e-21, "Breaking your own rules, even"),
            eAch(122, 1e-22, "We already rewrote Physics so why not"),
            eAch(123, 1e-23, "Not not smaller"),
            eAch(124, 1e-24, "I WAS IN A POOL!!"),
            eAch(125, 1e-25, "Now cook over medium heat for an hour"),
            eAch(126, 1e-26, "That was fast..."),
            eAch(127, 1e-27, "Relatively small"),
            eAch(128, 1e-28, "Bonus round: try to find it on your shoe"),
            eAch(129, 1e-29, "The closest shave"),
            eAch(130, 1e-30, "Ran out of milestones"),

            // Research achievements
            rAch(200, consts.startFloor, "First braining"),
            rAch(201, 1e-1, "A small library"),
            rAch(202, 1e-2, "It was all romance novels"),
            rAch(203, 1e-3, "Need more beakers"),
            rAch(204, 1e-4, "SCIENCE!"),
            rAch(205, 1e-5, "Slightly better qualified"),
            rAch(206, 1e-6, "Transistors are small"),
            rAch(207, 1e-7, "Computers that fit in your hand"),
            rAch(208, 1e-8, "Grey goo everywhere"),
            rAch(209, 1e-9, "Not talking about pencil leads"),
            rAch(210, 1e-10, "A project named after a city burough"),
            rAch(211, 1e-11, "No more roving laser sights"),
            rAch(212, 1e-12, "Scott Bakula would be proud"),
            rAch(213, 1e-13, "The best way to learn"),
            rAch(214, 1e-14, "Messing up some mundane detail"),
            rAch(215, 1e-15, "No, not Centrinos"),
            rAch(216, 1e-16, "Everything is shoelaces"),
            rAch(217, 1e-17, "Unraveled the theory"),
            rAch(218, 1e-18, "High in fiber"),
            rAch(219, 1e-19, "Breaking new ground"),
            rAch(220, 1e-20, "Expanding your horizons, man"),
            rAch(221, 1e-21, "The old rules stunk"),
            rAch(222, 1e-22, "Animaniacs was right"),
            rAch(223, 1e-23, "Space is pretty small"),
            rAch(224, 1e-24, "Does this make you intergalactic?"),
            rAch(225, 1e-25, "Looking suspiciously like atoms"),
            rAch(226, 1e-26, "It's pockets all the way down"),
            rAch(227, 1e-27, "We haven't used 'xm' yet; is that taken?"),
            rAch(228, 1e-28, "Everything is suddenly clear"),
            rAch(229, 1e-29, "The finest print"),
            rAch(230, 1e-30, "You broke mah numbers!"),

            // Sales Team achievements
            sTeamAch(301, 1, "Delegating"),
            sTeamAch(302, 50, "Sales team GO!"),
            sTeamAch(303, 100, "A sales force to be reckoned with"),

            // Engineering Team achievements
            eTeamAch(401, 1, "Doing the dirty work"),
            eTeamAch(402, 50, "Hired goons"),
            eTeamAch(403, 100, "Can we shrink them?"),

            // Research Team achievements
            rTeamAch(501, 1, "Know a guy"),
            rTeamAch(502, 50, "For idle science"),
            rTeamAch(503, 100, "Set it and forget it"),

            // Reset achievements
            {
                id: 701,
                name: "Obligatory prestige",
                desc: "Reset the game. Each reset increases the effectiveness of your research and engineering.",
                func: function (gameData) {
                    return gameData.resets > 0;
                },
                img: consts.imageReset
                //hide: function (gameData) {
                //    return gameData.lifetimeCash < consts.resetCost;
                //}
            },

            // Special achievements
            {
                id: 601,
                name: "Missing the point",
                desc: "Earn " + format.displayCash(1000) +
                    " without miniaturizing.",
                func: function (gameData) {
                    return gameData.sessionCash >= 1000 &&
                        gameData.size >= consts.startSize;
                },
                img: consts.imageQuestion
            },
            {
                id: 602,
                name: "Bleeding edge",
                desc: "Engineer the size down extremely close to the theoretical minimum.",
                func: function (gameData) {
                    return gameData.size - gameData.floor <
                        gameData.size / 1000000;
                },
                img: consts.imageWrenchBleeding
            },
            {
                id: 603,
                name: "Thinking in one hand",
                desc: "Discover a theoretical minimum that is 1/100th the current size.",
                func: function (gameData) {
                    return gameData.floor <= gameData.size / 100;
                },
                img: consts.imageThinking
            }
        ];
    }());

    return achievements;
}(m13n.consts, m13n.format));
/*jslint browser: true*/
/*global jQuery */
/*global m13n */

if (window.m13n === undefined) {
    window.m13n = {};
}

//
// GAME CLASSES
//
m13n.widget = (function ($, consts, util, format) {
    "use strict";

    var $tooltip = (function () {
            var $widget = $("<div/>", { class: "tooltip" }),
                $title = $("<h3/>"),
                $text = $("<div/>", { class: "detail" });
            $widget.append($title);
            $widget.append($text);
            return $widget;
        }()),
        tooltipData;

    function update($tooltip, data) {
        if (data === undefined) {
            return;
        }
        $tooltip.find("h3").html(data.title !== null ? data.title : "");
        $tooltip.find("div.detail").html(data.text);
    }

    function showTooltip($tooltip, data) {
        tooltipData = data;
        update($tooltip, data);
        $tooltip.show();
    }

    function hideTooltip($tooltip) {
        tooltipData = undefined;
        $tooltip.hide();
    }

    function registerTooltip($control, text, title) {
        var data = {
            title: util.nvl(title, null),
            text: text
        };
        $control.on("mouseover", function () {
            showTooltip($tooltip, data);
        });
        $control.on("mouseout", function () {
            hideTooltip($tooltip);
        });
    }

    $(document).on("mousemove", function (event) {
        function verticalMax($widget) {
            return $widget.offset().top + $widget.outerHeight();
        }
        function withinVerticalBound($widget) {
            var $parent = $widget.parent();
            return verticalMax($widget) < verticalMax($parent);
        }
        function horizontalMax($widget) {
            return $widget.offset().left + $widget.outerWidth();
        }
        function withinHorizontalBound($widget) {
            var $parent = $widget.parent();
            return horizontalMax($widget) < horizontalMax($parent);
        }
        var margin = 16,
            pos;
        if ($tooltip.is(":visible")) {
            pos = {
                left: event.pageX + margin,
                top: event.pageY + margin
            };
            $tooltip.offset(pos);
            if (!withinVerticalBound($tooltip)) {
                pos.top = event.pageY - margin - $tooltip.outerHeight();
            }
            if (!withinHorizontalBound($tooltip)) {
                pos.left = event.pageX - margin - $tooltip.outerWidth();
            }
            $tooltip.offset(pos);
        }
    });

    return {
        /// Makes numbers go.
        Progressor: function (name, params, gameData) {
            var th = this,

                // private parts
                actualCost,
                actualCooldown,
                isPaused = true,
                explicitPause = false,
                isAuto = util.nvl(params.isAuto, false),
                action = util.nvl(params.action, function () { return; }),
                quantity = util.nvl(
                    params.quantity,
                    isAuto ? "dummyAuto" : "dummyManual"
                ),

                // cooldown management
                defaultCooldownRemaining = 0,
                getCooldownRemaining = util.nvl(
                    params.getCooldownRemaining,
                    function () { return defaultCooldownRemaining; }
                ),
                setCooldownRemaining = util.nvl(
                    params.setCooldownRemaining,
                    function (val) { defaultCooldownRemaining = val; }
                ),
                $cooldownBar,
                $label,
                $costLabel,
                $button,
                $qty;

            function labelText() {
                var autoText = isAuto
                    ? " (" + (isPaused
                        ? (gameData[quantity].current === 0 ? "NONE" : "OFF")
                        : "ON") + ")"
                    : "";
                return th.name + autoText;
            }

            function getNewCooldown(time) {
                return isPaused
                    ? getCooldownRemaining()
                    : getCooldownRemaining() - (time * gameData[quantity].current);
            }

            function updateCooldownBar() {
                var c = getCooldownRemaining(),
                    effectiveRemaining = c < 0 ? 0 : c,
                    warmUp = Math.abs(effectiveRemaining - actualCooldown),
                    percentReady = warmUp / actualCooldown * 100;
                $cooldownBar.css("width", percentReady + "%");
            }

            function togglePause(isExplicit) {
                isPaused = !isPaused;
                explicitPause = isExplicit === true;
                $label.text(labelText());
            }

            function pauseStateShouldChange() {
                return (isPaused && gameData[quantity].current >= 1 && !explicitPause) ||
                    (!isPaused && gameData[quantity].current === 0);
            }

            function setActualCost() {
                actualCost = Math.round(th.cost * th.costScale());
                $costLabel.text(format.displayCash(actualCost));
            }

            function resetActualCooldown() {
                return th.cooldown * th.cooldownScale();
            }

            function testButtonDisabled() {
                return !th.canAfford(actualCost, gameData.cash) ||
                    (getCooldownRemaining() > 0 && !isAuto) ||
                    (isAuto && gameData[quantity].current === 0);
            }

            function quantityText() {
                return (gameData[quantity].current === gameData[quantity].max)
                    ? gameData[quantity].current
                    : gameData[quantity].current + "/" + gameData[quantity].max;
            }

            // construction
            this.nameFunc = typeof name === "function" ? name : function () {
                return name;
            };
            this.name = this.nameFunc();
            this.rate = util.nvl(params.rate, function () { return 1; });
            this.cost = util.nvl(params.cost, 0);
            actualCost = this.cost;
            this.costScale = util.nvl(params.costScale, function () {
                return 1;
            });
            this.cooldownScale = util.nvl(params.cooldownScale, function () {
                return 1;
            });
            this.canAfford = util.nvl(params.canAfford, function () {
                return true;
            });
            this.cooldown = util.nvl(
                params.cooldown,
                consts.defaultCooldown
            );
            this.class = util.nvl(params.class, "");
            this.hide = util.nvl(params.hide, function () { return false; });

            actualCooldown = resetActualCooldown();
            if (isAuto && getCooldownRemaining() === 0) {
                setCooldownRemaining(actualCooldown);
            }

            // widgets
            $cooldownBar = $("<div/>");
            $label = $("<label/>", {
                text: labelText()
            });
            $costLabel = $("<span/>", {
                class: "price" + (actualCost === 0 ? " hidden" : ""),
                text: format.displayCash(actualCost)
            });
            $button = $("<button/>", {
                class: (isAuto ? "toggle" : "action") + " " + th.class
            });
            if (params.tooltip !== undefined) {
                registerTooltip(
                    $button,
                    params.tooltip,
                    util.nvl(params.tooltipTitle, this.nameFunc)
                );
            }
            $qty = $("<span/>", {
                class: "spinnerValue",
                text: quantityText()
            });

            this.reset = function () {
                actualCooldown = resetActualCooldown();
                setCooldownRemaining(isAuto ? actualCooldown : 0);
                updateCooldownBar();
            };

            this.addTime = function (time) {
                if (th.hide()) {
                    th.$widget.addClass("hidden");
                } else {
                    th.$widget.removeClass("hidden");
                }

                if (getCooldownRemaining() > 0) {
                    setCooldownRemaining(getNewCooldown(time));
                    updateCooldownBar();
                }

                if (th.canAfford(actualCost, gameData.cash)) {
                    $costLabel.removeClass("tooMuch");
                } else {
                    $costLabel.addClass("tooMuch");
                }

                if (getCooldownRemaining() <= 0 && isAuto && !isPaused) {
                    if (gameData[quantity].current > 0) {
                        th.progress();
                    } else {
                        togglePause();
                    }
                }

                $button.prop("disabled", testButtonDisabled());

                setActualCost();

                $qty.text(quantityText());
                if (pauseStateShouldChange()) {
                    togglePause();
                }

                th.name = th.nameFunc();
                $label.text(labelText());
            };

            this.progress = function () {
                if (!action(th.rate(), actualCost)) {
                    return false;
                }

                th.addCooldown();
                actualCooldown = resetActualCooldown();
                return true;
            };

            this.addCooldown = function () {
                if (getCooldownRemaining() > 0) {
                    setCooldownRemaining(0);
                }
                setCooldownRemaining(getCooldownRemaining() + actualCooldown);
            };

            this.$widget = (function () {
                function makeQtyControl() {
                    var $qtyControl = $("<span/>", { class: "qtyControl" }),
                        $remove = $("<button/>", { text: "-" }),
                        $add = $("<button/>", { text: "+" });

                    $remove.click(function () {
                        if (gameData[quantity].current <= 0) {
                            return;
                        }

                        gameData[quantity].current -= 1;
                        $qty.text(quantityText());
                        if (pauseStateShouldChange()) {
                            togglePause();
                        }
                    });

                    $add.click(function () {
                        if (gameData[quantity].current >= gameData[quantity].max) {
                            return;
                        }

                        gameData[quantity].current += 1;
                        $qty.text(quantityText());
                        if (pauseStateShouldChange()) {
                            togglePause();
                        }
                    });

                    $remove.appendTo($qtyControl);
                    $qty.appendTo($qtyControl);
                    $add.appendTo($qtyControl);

                    return $qtyControl;
                }

                var $widget = $("<div/>"),
                    $textContainer = $("<span/>", { class: "text" }),
                    $cooldownBox = $("<div/>", {
                        class: actualCooldown === 0 ? "hidden" : ""
                    });

                $button.appendTo($widget);
                $("<span/>", { class: "icon" }).appendTo($button);
                $textContainer.appendTo($button);
                $label.appendTo($textContainer);
                $costLabel.appendTo($textContainer);

                $cooldownBox.addClass("progressBar");
                $cooldownBox.appendTo($button);
                $cooldownBar.appendTo($cooldownBox);

                $button.click(function () {
                    if (isAuto) {
                        if (gameData[quantity].current <= 0) {
                            return;
                        }

                        // "true" here means explicit action
                        togglePause(true);
                    } else {
                        th.progress();
                    }
                });

                if (isAuto) {
                    makeQtyControl().appendTo($widget);
                }

                return $widget;
            }());

            // more initialization
            if (isAuto) {
                th.addCooldown();
            }
        },

        Display: function (label, functions) {
            var th = this,
                $value = $("<span/>");

            this.label = label;
            this.valueFunc = functions.getValue;
            this.formatFunc = util.nvl(functions.format, function (value) {
                return value;
            });
            this.reset = function () { return; };
            this.addTime = function () {
                th.update();
            };
            this.update = function () {
                $value.html(th.formatFunc(th.valueFunc()));
            };
            this.$widget = (function () {
                var $display = $("<div/>"),
                    $label = $("<label/>");
                $display.addClass("display");
                $label.text(th.label !== undefined
                    ? th.label + ":"
                    : "");
                $label.appendTo($display);
                $value.appendTo($display);

                return $display;
            }());

            this.update();
        },

        SizeDiagram: function (sizeFunc, floorFunc) {
            var th = this,
                $label = $("<label/>", {
                    html: format.displaySize(1)
                }),
                $sizeBox = $("<div/>"),
                $floorBox = $("<div/>");

            this.sizeFunc = util.nvl(sizeFunc, function () { return 0.75; });
            this.floorFunc = util.nvl(floorFunc, function () { return 0.5; });
            this.zoomLevel = 1;
            this.zoomRate = 5;

            function getBaseline(size) {
                var baseline = 1,
                    test = 1;
                do {
                    baseline = test;
                    test *= 0.1;
                } while (test > size);
                return baseline;
            }

            function getNewZoom(baseline, elapsed) {
                var oldZoom = th.zoomLevel,
                    diff = oldZoom - baseline,
                    zoomSecond = diff * th.zoomRate,
                    vector = zoomSecond * (elapsed / 1000),
                    newZoom = oldZoom - vector;
                return newZoom < baseline ? baseline : newZoom;
            }

            function getSizeStyles(elapsed) {
                function root(val) {
                    return val; //Math.pow(val, 1/3); 
                }
                var size = th.sizeFunc(),
                    floor = th.floorFunc(),
                    baseline = getBaseline(size),
                    sizePercent,
                    floorPercent;
                th.zoomLevel = getNewZoom(baseline, elapsed);
                sizePercent = root(size) / root(th.zoomLevel) * 100;
                floorPercent = root(floor) / root(size) * 100;
                return {
                    size: sizePercent + "%",
                    floor: floorPercent + "%",
                };
            }

            function setSquareSize($widget, value) {
                $widget.css("width", value);
                $widget.css("height", value);
            }

            this.reset = function () { return; };
            this.addTime = function (elapsed) {
                th.update(elapsed);
            };
            this.update = function (elapsed) {
                var sizeStyles = getSizeStyles(elapsed);
                setSquareSize($sizeBox, sizeStyles.size);
                setSquareSize($floorBox, sizeStyles.floor);
                $label.html(format.displaySize(th.zoomLevel));
            };
            this.$widget = (function () {
                var $container = $("<div/>");
                $container.addClass("sizeDiagram");
                $label.appendTo($container);
                $sizeBox.appendTo($container);
                $floorBox.appendTo($sizeBox);
                return $container;
            }());
        },

        AchievementBox: function (achievements, gameData, notifier) {
            var th = this;

            function updateCounts() {
                var $current = th.$widget.find("span.currentValue"),
                    $max = th.$widget.find("span.maxValue"),
                    currentCount = achievements.reduce(function (sum, current) {
                        return sum + (current.achieved === true ? 1 : 0);
                    }, 0);
                $current.text(currentCount);
                $max.text(achievements.length);
            }

            this.$awidgets = (function () {
                function $awidget(a) {
                    var $aw = $("<div/>");
                    $aw.addClass("achievement");
                    registerTooltip($aw, a.desc, a.name);
                    if (a.img !== undefined) {
                        $aw.css('background-image', 'url("content/' + a.img + '")');
                    }
                    $aw.data("achievement", a);
                    return $aw;
                }
                var output = [], i;
                for (i = 0; i < achievements.length; i += 1) {
                    output.push($awidget(achievements[i]));
                }
                return output;
            }());
            this.test = function () {
                function testWidget($awidget) {
                    var a = $awidget.data("achievement"),
                        got;
                    if (typeof (a.hide) === "function") {
                        if (a.hide(gameData) && a.achieved !== true) {
                            $awidget.addClass("hidden");
                        } else {
                            $awidget.removeClass("hidden");
                        }
                    }
                    if (a.achieved === true) {
                        $awidget.addClass("earned");
                        return;
                    }
                    got = a.func(gameData);
                    if (got) {
                        $awidget.addClass("earned");
                        if (a.achieved === false) {
                            notifier.notify(
                                "You earned the achievement \"" + a.name + "\"!",
                                "achievementMessage",
                                10000
                            );
                        }
                    }
                    a.achieved = got;
                }
                var i;
                for (i = 0; i < th.$awidgets.length; i += 1) {
                    testWidget(th.$awidgets[i]);
                }
            };
            this.reset = function () { return; };
            this.addTime = function () {
                th.test();
                updateCounts();
            };
            this.$widget = (function () {
                var $container = $("<div/>", { class: "achievementBox" }),
                    $header = $("<div/>", {
                        class: "header",
                        html: "Achievements: <span class='currentValue'>0</span>/<span class='maxValue'>0</span>"
                    }),
                    $innerContainer = $("<div/>"),
                    i;
                $header.appendTo($container);
                $innerContainer.appendTo($container);
                for (i = 0; i < th.$awidgets.length; i += 1) {
                    th.$awidgets[i].appendTo($innerContainer);
                }
                return $container;
            }());
        },

        Notifier: function () {
            var th = this,
                transitionTime = 500;

            function clearWidget(widget) {
                $(widget).hide(transitionTime, function () {
                    $(widget).remove();
                });
            }

            this.notify = function (msg, className, timeout) {
                var $msg;
                className = util.nvl(className, "");
                timeout = util.nvl(timeout, 5000);
                $msg = $("<div/>", {
                    text: msg,
                    class: className
                });
                $msg.hide();
                $msg.appendTo(th.$widget);
                $msg.show(transitionTime, function () {
                    setTimeout(function () {
                        clearWidget($msg);
                    }, timeout);
                });
            };
            this.reset = function () { return; };
            this.addTime = function () { return; };
            this.$widget = (function () {
                var $div = $("<div/>");
                $div.addClass("notifier");
                return $div;
            }());
        },

        Container: function (selector) {
            var controls = [];
            $tooltip.appendTo(selector);

            this.add = function (control) {
                control.$widget.appendTo(selector);
                controls.push(control);
            };
            this.addSet = function (controlSet) {
                var $controlSet = $("<div/>"), i;
                $controlSet.addClass("controlSet");
                $controlSet.appendTo(selector);
                for (i = 0; i < controlSet.length; i += 1) {
                    controlSet[i].$widget.appendTo($controlSet);
                    controls.push(controlSet[i]);
                }
            };
            this.reset = function () {
                var i;
                for (i = 0; i < controls.length; i += 1) {
                    controls[i].reset();
                }
            };
            this.addTime = function (elapsed) {
                var i;
                update($tooltip, tooltipData);
                for (i = 0; i < controls.length; i += 1) {
                    controls[i].addTime(elapsed);
                }
            };
        }
    };
}(jQuery, m13n.consts, m13n.util, m13n.format));
/*jslint browser: true*/
/*global jQuery */
/*global m13n */

if (window.m13n === undefined) {
    window.m13n = {};
}

m13n.game = (function ($, consts, data, format, achievements, widget, integration) {
    "use strict";

    var gameData = data.newGameData(),
        container,
        sizeDisplay,
        minDisplay,
        cashDisplay,
        shipSizeDisplay,
        notifier,
        diagram,
        achievementBox,
        eClicker,
        eTeam,
        eHire,
        rClicker,
        rTeam,
        rHire,
        sClicker,
        sTeam,
        sHire,
        resetButton;

    //function getScrollBarWidth() {
    //    var testWidth = 100,
    //        $outer = $('<div>').css({
    //            visibility: 'hidden',
    //            width: testWidth,
    //            overflow: 'scroll'
    //        }).appendTo('body'),
    //        widthWithScroll = $('<div>').css({
    //            width: '100%'
    //        }).appendTo($outer).outerWidth();
    //    $outer.remove();
    //    return testWidth - widthWithScroll;
    //}

    function prestigeReset(gameData, container) {
        // reset
        gameData.cash = consts.startCash;
        gameData.sessionCash = consts.startCash;
        gameData.size = consts.startSize;
        gameData.floor = consts.startFloor;
        gameData.shipSize = consts.shipSize;
        gameData.sTeamSize = { current: 0, max: 0, cooldown: 0 };
        gameData.eTeamSize = { current: 0, max: 0, cooldown: 0 };
        gameData.rTeamSize = { current: 0, max: 0, cooldown: 0 };

        // prestige
        gameData.engineerRate *= consts.engineerRate;
        gameData.researchRate *= consts.researchRate;
        gameData.resets += 1;

        container.reset();

        // return false to avoid charging the cost.
        return false;
    }

    //
    // MONEY & SCALING CALCULATION FUNCTIONS
    //

    function scaleCount(value) {
        var test = 1,
            count = 0;
        do {
            test *= 0.1;
            if (test > value) {
                count += 1;
            }
        } while (test > value);
        return count;
    }
    function costScale(value, step) {
        var scale = 1,
            count = scaleCount(value),
            i;
        for (i = 0; i < count; i += 1) {
            scale *= step;
        }
        return scale;
    }
    function costScaleTeam(value, step) {
        return Math.pow(1 + step, value);
    }
    function cooldownScaleTeam(value, scale, teamSize, synergyStep) {
        var progressSlowdown = costScale(value, scale),
            teamSizeDivisionBonus = 1 +
                (Math.floor(teamSize / synergyStep) / 4),
            output = progressSlowdown / teamSizeDivisionBonus;
        return output;
    }
    function testCanAfford(cost, cash) { return cost <= cash; }
    function doIfCanAfford(action, cost, gameData) {
        if (!testCanAfford(cost, gameData.cash)) {
            return false;
        }
        if (!action()) {
            return false;
        }
        gameData.cash -= cost;
        return true;
    }

    function gridPack(ballSize, boxSize) {
        return Math.floor(boxSize / Math.pow(ballSize, 3));
    }
    function getShipUnits() {
        return gridPack(gameData.size, gameData.shipSize);
    }
    function getShipUnitPrice() {
        var units = getShipUnits();
        return Math.pow(units * consts.unitPriceStart, 1 / 3) / units;
    }
    function getShipPrice() {
        return getShipUnits() * getShipUnitPrice();
    }

    //
    // GAME INSTANCES
    //

    function loadControls() {
        var eTiers, rTiers,
            eTeamCooldownScale = function () {
                return costScale(
                    gameData.size,
                    consts.engineerTeamCooldownScale
                );
            },
            rTeamCooldownScale = function () {
                return costScale(
                    gameData.size,
                    consts.researchTeamCooldownScale
                );
            },
            sTeamCooldownScale = function () {
                return cooldownScaleTeam(
                    gameData.size,
                    consts.salesTeamCooldownScale,
                    gameData.sTeamSize.max,
                    consts.salesTeamSynergyStep
                );
            },
            hireToolTip = function (
                cool,
                coolScaleFunc,
                teamSizeFunc,
                teamName,
                teamMember,
                taskName,
                special
            ) {
                return function () {
                    var cooldown = cool * coolScaleFunc() / 1000,
                        currentRate = cooldown / teamSizeFunc(),
                        n = teamMember.substring(0, 1) === 'e' ? 'n' : '';
                    return "<p>Adds a" + n + " " + teamMember + " to your " +
                        teamName + " team. " +
                        "Each " + taskName + " at this tier takes " +
                        cooldown + " work seconds to complete. " +
                        special + "</p>" +
                        "<div>Current rate: " + currentRate + " seconds per " +
                        taskName + ".</div>";
                };
            };
        container = new widget.Container(consts.containerSelector);
        // Game data displays
        sizeDisplay = new widget.Display("Size", {
            getValue: function () { return gameData.size; },
            format: format.displaySize
        });
        minDisplay = new widget.Display("Theoretical Minimum", {
            getValue: function () { return gameData.floor; },
            format: format.displaySize
        });
        cashDisplay = new widget.Display("Cash", {
            getValue: function () { return gameData.cash; },
            format: format.displayCash
        });
        shipSizeDisplay = new widget.Display("Shipping Container", {
            getValue: function () { return gameData.shipSize; },
            format: function (value) {
                var unitPrice = getShipUnitPrice(),
                    decimalPlaces = 4,
                    minDisplayPrice = Math.pow(10, decimalPlaces * -1),
                    isBelowMin = unitPrice < minDisplayPrice,
                    unitPriceToDisplay = isBelowMin
                        ? minDisplayPrice
                        : unitPrice,
                    shipUnits = getShipUnits(),
                    uplural = shipUnits === 1 ? "unit" : "units",
                    manifest = shipUnits > 1000000000000
                        ? "billions and billions of units"
                        : format.displayCount(shipUnits) + " " +
                            uplural + " @ " +
                            (isBelowMin ? "< " : "") +
                            format.displayCash(
                                unitPriceToDisplay,
                                decimalPlaces
                            ) +
                            " per unit",
                    shipPriceText = "<br/>Sale Price " +
                        format.displayCash(getShipPrice());
                return format.displayCuMeters(value) +
                    ", shipping " + manifest +
                    shipPriceText;
            }
        });
        notifier = new widget.Notifier();
        diagram = new widget.SizeDiagram(
            function () { return gameData.size; },
            function () { return gameData.floor; }
        );
        achievementBox =
            new widget.AchievementBox(achievements, gameData, notifier);

        /*jslint unparam: true*/
        function hireButtonParams(startCost, step, teamSize, tooltip) {
            return {
                cost: startCost,
                costScale: function () {
                    return costScaleTeam(gameData[teamSize].max, step);
                },
                action: function (rate, cost) {
                    return doIfCanAfford(
                        function () {
                            gameData[teamSize].max += 1;
                            gameData[teamSize].current += 1;
                            return true;
                        },
                        cost,
                        gameData
                    );
                },
                canAfford: testCanAfford,
                cooldown: 0,
                class: "hireButton",
                hide: function () {
                    return gameData.lifetimeCash < startCost;
                },
                tooltip: tooltip
            };
        }
        /*jslint unparam: false*/

        function pickLabel(labels, metric) {
            var max = labels.length - 1,
                steps = scaleCount(metric),
                selected = steps > max ? max : steps;
            return labels[selected];
        }

        // Engineering, the guys who make the thing smaller
        function eCalc(rate) {
            var floor = gameData.floor,
                shrinkable = gameData.size - floor,
                shrunken;
            if (shrinkable < 0) {
                return;
            }
            shrunken = shrinkable * rate;
            return floor + shrunken;
        }
        function eAction(rate) {
            gameData.size = eCalc(rate);
            return true;
        }

        eTiers = [
            "Whack it",
            "Try a vice",
            "Use smaller parts",
            "Use fewer parts",
            "Use smaller compounds",
            "Use fewer compounds",
            "Use smaller atoms",
            "Use fewer atoms",
            "Maybe just sell one atom and call it a day",
            "Split atoms",
            "Undo Nuclear Winter",
            "Apply Quantum Mechanics",
            "Cut the boring parts",
            "Apply smaller Quantum Mechanics",
            "Redesign it",
            "Sew little strings",
            "Sew even littler strings",
            "Separate fibers from strings",
            "Separate fibers from fibers",
            "Let the purple walrus fine tune it",
            "Defy Physics",
            "Make quantum foam from subfibers (you heathen)",
            "Make it bigger (just kidding, do the opposite)",
            "Make it better (by making it smaller)",
            "Put it in a pressure chamber",
            "Walk the Planck",
            "Make everything else bigger",
            "Step on one by accident",
            "Shave off bits with a yoctoscopic razor",
            "Inch toward the end game",
            "Whack it (but with a really tiny hammer)"];

        eClicker = new widget.Progressor(
            function () {
                return pickLabel(eTiers, gameData.size);
            },
            {
                rate: function () { return gameData.engineerRate; },
                cost: consts.engineerCost,
                costScale: function () {
                    return costScale(gameData.size, consts.engineerCostScale);
                },
                action: function (rate, cost) {
                    return doIfCanAfford(
                        function () { return eAction(rate); },
                        cost,
                        gameData
                    );
                },
                canAfford: testCanAfford,
                class: "showIcon engineerClicker",
                tooltipTitle: "Engineer",
                tooltip: function () {
                    var currentVal = gameData.size,
                        newVal = eCalc(gameData.engineerRate),
                        reducePct = (1 - gameData.engineerRate);
                    return "<p>Reduces the size toward the theoretical minimum by " +
                        format.displayPercent(reducePct) + ". " +
                        "Making things smaller is the object of the game. " +
                        "Also, when the size gets smaller, " +
                        "more units can fit into a shipping container.</p>" +
                        "<div>Current: " +
                        format.displaySize(currentVal) + "</div>" +
                        "<div>Next: " +
                        format.displaySize(newVal) + "</div>";
                }
            },
            gameData
        );
        eTeam = new widget.Progressor(
            "Engineering Team",
            {
                isAuto: true,
                action: function () { return eClicker.progress(); },
                cooldown: consts.engineerTeamCooldown,
                cooldownScale: eTeamCooldownScale,
                getCooldownRemaining: function () {
                    return gameData.eTeamProgress;
                },
                setCooldownRemaining: function (value) {
                    gameData.eTeamProgress = value;
                },
                quantity: "eTeamSize",
                hide: function () {
                    return gameData.eTeamSize.max <= 0;
                }
            },
            gameData
        );
        eHire = new widget.Progressor(
            "Hire an engineer",
            hireButtonParams(
                consts.engineerHireCost,
                consts.engineerHireCostScale,
                "eTeamSize",
                hireToolTip(
                    consts.engineerTeamCooldown,
                    eTeamCooldownScale,
                    function () { return gameData.eTeamSize.current; },
                    "engineering",
                    "engineer",
                    "improvement",
                    "When the engineering team makes an improvement, " +
                        "it will still cost money as if you had done it yourself."
                )
            ),
            gameData
        );

        // Research, the guys who find out how small the thing can get
        function rCalc(rate) {
            return gameData.floor * rate;
        }
        function rAction(rate) {
            gameData.floor = rCalc(rate);
            return true;
        }

        rTiers = [
            "Buy a book",
            "Actually read a book",
            "Do science",
            "Do science harder",
            "Consult a Physicist",
            "Reverse Engineer old CPUs",
            "Steal Intel prototypes",
            "Study Nanobots",
            "Look into Graphene",
            "Study Nuclear Physics",
            "Get off of government watch lists",
            "Study Quantum Mechanics",
            "Teach Quantum Mechanics",
            "Wait, what's a quark?",
            "Neutrinos?",
            "Try String Theory",
            "Find what makes a string",
            "Find even smaller building blocks",
            "Publish a new theory",
            "Try psychoactive drugs",
            "Rewrite Physics",
            "Discover pocket universes",
            "Discover pocket nebulae",
            "Discover pocket galaxies",
            "Discover pocket solar systems",
            "Discover pocket pockets",
            "Petition SI for smaller units",
            "Forget everything you've learned",
            "Buy a smaller book",
            "Justify scientific notation",
            "Just make things up"];
        rClicker = new widget.Progressor(
            function () {
                return pickLabel(rTiers, gameData.floor);
            },
            {
                rate: function () { return gameData.researchRate; },
                cost: consts.researchCost,
                costScale: function () {
                    return costScale(
                        gameData.floor,
                        consts.researchCostScale
                    );
                },
                action: function (rate, cost) {
                    return doIfCanAfford(
                        function () { return rAction(rate); },
                        cost,
                        gameData
                    );
                },
                canAfford: testCanAfford,
                class: "showIcon researchClicker",
                tooltipTitle: "Research",
                tooltip: function () {
                    var currentVal = gameData.floor,
                        newVal = rCalc(gameData.researchRate),
                        reducePct = (1 - gameData.researchRate);
                    return "<p>Reduces the theoretical minimum by " +
                        format.displayPercent(reducePct) + ", " +
                        "allowing you to engineer a smaller size.</p>" +
                        "<div>Current: " +
                        format.displaySize(currentVal) + "</div>" +
                        "<div>Next: " +
                        format.displaySize(newVal) + "</div>";
                }
            },
            gameData
        );
        rTeam = new widget.Progressor(
            "Research Team",
            {
                isAuto: true,
                action: function () { return rClicker.progress(); },
                cooldown: consts.researchTeamCooldown,
                cooldownScale: rTeamCooldownScale,
                getCooldownRemaining: function () {
                    return gameData.rTeamProgress;
                },
                setCooldownRemaining: function (value) {
                    gameData.rTeamProgress = value;
                },
                quantity: "rTeamSize",
                hide: function () {
                    return gameData.rTeamSize.max <= 0;
                }
            },
            gameData
        );
        rHire = new widget.Progressor(
            "Hire a researcher",
            hireButtonParams(
                consts.researchHireCost,
                consts.researchHireCostScale,
                "rTeamSize",
                hireToolTip(
                    consts.researchTeamCooldown,
                    rTeamCooldownScale,
                    function () { return gameData.rTeamSize.current; },
                    "research",
                    "researcher",
                    "discovery",
                    "When the research team makes a discovery, " +
                        "it will still cost money as if you had done it yourself."
                )
            ),
            gameData
        );

        // Shipping/Sales, the guys who distribute the thing for cash
        function sAction() {
            var sale = getShipPrice();
            gameData.cash += sale;
            gameData.sessionCash += sale;
            gameData.lifetimeCash += sale;
            return true;
        }

        sClicker = new widget.Progressor(
            "Sell a shipment",
            {
                action: sAction,
                class: "showIcon salesClicker",
                tooltip: function () {
                    var shipSize = gameData.shipSize;
                    return "<p>Sells a shipment of as many units as can fit into a " +
                        format.displayCuMeters(shipSize) + " container.<p>" +
                        "<div>Due to economies of scale, each unit is worth $" +
                        getShipUnitPrice() + ".  Each shipment can hold up to " +
                        format.displayCount(getShipUnits()) + " units. " +
                        "Therefore, each shipment is worth " +
                        format.displayCash(getShipPrice()) + ".</div>";
                }
            },
            gameData
        );
        sTeam = new widget.Progressor("Sales Team", {
            isAuto: true,
            action: function () { return sClicker.progress(); },
            cooldown: consts.salesTeamCooldown,
            cooldownScale: sTeamCooldownScale,
            getCooldownRemaining: function () {
                return gameData.sTeamProgress;
            },
            setCooldownRemaining: function (value) {
                gameData.sTeamProgress = value;
            },
            quantity: "sTeamSize",
            hide: function () {
                return gameData.sTeamSize.max <= 0;
            }
        }, gameData);
        sHire = new widget.Progressor(
            "Hire a salesperson",
            hireButtonParams(
                consts.salesHireCost,
                consts.salesHireCostScale,
                "sTeamSize",
                hireToolTip(
                    consts.salesTeamCooldown,
                    sTeamCooldownScale,
                    function () { return gameData.sTeamSize.current; },
                    "sales",
                    "salesperson",
                    "sale",
                    "Every " + consts.salesTeamSynergyStep +
                        " salespeople add a synergy bonus, " +
                        "reducing number of work seconds required to perform a sale."
                )
            ),
            gameData
        );
        /*jslint unparam: true*/
        resetButton = new widget.Progressor(
            "Make something else smaller (Reset)",
            {
                action: function (meh, cost) {
                    return doIfCanAfford(
                        function () { return prestigeReset(gameData, container); },
                        cost,
                        gameData
                    );
                },
                cost: consts.resetCost,
                costScale: function () {
                    return Math.pow(10, gameData.resets * 3);
                },
                canAfford: testCanAfford,
                class: "showIcon resetButton",
                //hide: function () {
                //    return gameData.lifetimeCash < consts.resetCost / 100000;
                //},
                tooltipTitle: "Reset",
                tooltip: function () {
                    var currentVal = gameData.researchRate,
                        newVal = gameData.researchRate * consts.researchRate,
                        enhancePct = (1 - consts.researchRate);
                    return "<p>Resets everything except achievements. " +
                        "Reduces the Research and Engineering multipliers by " +
                        format.displayPercent(enhancePct) +
                        ", increasing their efficiency.</p>" +
                        "<div>Current reduction rate: " +
                        format.displayPercent(1 - currentVal) + "</div>" +
                        "<div>Next: " +
                        format.displayPercent(1 - newVal) + "</div>";
                }
            },
            gameData
        );
        /*jslint unparam: false*/
    }

    (function () {
        //
        // GAME LOOP FUNCTIONS AND VARIABLES
        //

        var sessionStart = null,
            lastTime = null;

        function saveEligible(thisTime) {
            var interval = consts.saveInterval;
            return thisTime - gameData.lastSave > interval &&
                thisTime - sessionStart > interval;
        }
        function getElapsed(thisTime) {
            var oldTime = lastTime === null ? thisTime : lastTime,
                elapsed = thisTime - oldTime,
                max = consts.maxTickLength;
            return elapsed > max ? max : elapsed;
        }
        function update() {
            var thisTime = Date.now(),
                elapsed = getElapsed(thisTime);
            lastTime = thisTime;
            container.addTime(elapsed);

            if (saveEligible(thisTime)) {
                data.save(gameData, achievements);
                integration.submitAll(gameData, achievements);
                notifier.notify(
                    consts.enableSaveData
                        ? "Game saved."
                        : "Saving disabled"
                );
            }
        }

        //
        // LAUNCH
        //

        $(document).ready(function () {
            sessionStart = Date.now();
            var loaded = false,
                tempData = data.load(),
                engineering,
                research,
                sales;
            if (tempData !== null) {
                data.overlayGameData(gameData, achievements, tempData);
                loaded = true;
            }

            loadControls();

            engineering = [eClicker, eHire, eTeam];
            research = [rClicker, rHire, rTeam];
            sales = [sClicker, sHire, sTeam];

            // right column
            container.add(diagram);
            container.add(achievementBox);
            container.add(resetButton);

            container.add(cashDisplay);
            container.add(shipSizeDisplay);
            container.addSet(sales);
            container.add(sizeDisplay);
            container.addSet(engineering);
            container.add(minDisplay);
            container.addSet(research);
            container.add(notifier);

            if (loaded) {
                notifier.notify("Loaded save from " + new Date(gameData.lastSave));
            }

            setInterval(update, consts.minTickLength);
        });
    }());
}(jQuery, m13n.consts, m13n.data, m13n.format, m13n.achievements, m13n.widget, m13n.integration));
