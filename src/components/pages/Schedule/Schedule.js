import Palette from "utils/Palette";
import Iconify from "components/reusable/Iconify";
import moment from "moment";

// Data-data sementara (tunggu API)
const SCHEDULES = [
    { backgroundColor: "#D1E7DD", color: "#0F5132" },
    { backgroundColor: Palette.LIGHT_GRAY, color: Palette.WHITE_GRAY },
    { backgroundColor: "#FFF3CD", color: "#664D03" },
    { backgroundColor: "#F8D7DA", color: "#842029" },
    { backgroundColor: "#D1E7DD", color: "#0F5132" },
    { backgroundColor: Palette.LIGHT_GRAY, color: Palette.WHITE_GRAY },
];

const OPERATIONAL_HOURS = [
    "08:00",
    "09.00",
    "10.00",
    "11.00",
    "12.00",
    "13.00",
    "14.00",
    "15.00",
    "16.00",
    "17.00",
    "18.00",
    "19.00",
    "20.00",
    "21.00",
    "22.00",
];

const DATE_HEADER_HEIGHT = 25;

const getPastWeekDates = () => {
    const result = [];

    for (let i = 0; i < 7; i++) {
        let date = new Date();
        date.setDate(date.getDate() - i);
        result.push(date);
    }

    return result;
};

export default function Schedule() {
    return (
        <div
            className="container-fluid"
            style={{ color: "#FFF", fontFamily: "Helixa", flex: 1 }}
        >
            {/* Schedule title & pagination */}
            <div className="d-flex justify-content-between">
                {/* Schedule title */}
                <div className="font-weight-bold" style={{ fontSize: 20 }}>
                    Schedule
                </div>

                {/* Schedule pagination */}
                <div
                    className="d-flex font-weight-bold align-items-center justify-content-center"
                    style={{ fontSize: 12, gap: 8 }}
                >
                    <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                            gap: 10,
                            padding: "6px 8px 6px 12px",
                            backgroundColor: Palette.LIGHT_GRAY,
                            borderRadius: 4,
                        }}
                    >
                        <div>Jan 2024</div>
                        <div
                            className="border"
                            style={{ borderRadius: 4, padding: "2px 8px" }}
                        >
                            W5
                        </div>
                    </div>
                    <div
                        className="d-flex align-items-center justify-content-center"
                        style={{ gap: 12 }}
                    >
                        <button className="btn p-0">
                            <Iconify
                                icon="mdi:chevron-left"
                                size={16}
                                color="#FFF"
                            />
                        </button>
                        <button className="btn p-0">
                            <Iconify
                                icon="mdi:chevron-right"
                                size={16}
                                color="#FFF"
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Schedule table */}
            <div className="d-flex" style={{ marginTop: 34, flex: 1 }}>
                {/* Table y-axis header */}
                <div className="d-flex flex-column">
                    <div style={{ height: DATE_HEADER_HEIGHT }}></div>

                    {/* Loop for getting the y-axis of the table (every hour in a day) */}
                    {OPERATIONAL_HOURS.map((text, index) => (
                        <div
                            className="d-flex justify-content-center align-items-start font-weight-bold"
                            style={{
                                flex: 1,
                                padding: "2px 4px",
                                fontSize: 12,
                            }}
                            key={index}
                        >
                            {text}
                        </div>
                    ))}
                </div>

                {/* Loop through all dates in current section */}
                {getPastWeekDates().map((date, index) => (
                    <div
                        className="d-flex flex-column"
                        style={{
                            flex: 1,
                        }}
                        key={index}
                    >
                        {/* Table x-axis header || current date */}
                        <div
                            className="d-flex align-items-center justify-content-center"
                            style={{
                                fontSize: 14,
                                color: Palette.INACTIVE_GRAY,
                                height: DATE_HEADER_HEIGHT,
                            }}
                        >
                            {moment(date).format("LL")}
                        </div>

                        {/* Loop for getting schedule data from each hour in current date  */}
                        {OPERATIONAL_HOURS.map((text, index) => (
                            <div
                                className="d-flex flex-column"
                                style={{
                                    gap: 8,
                                    padding: "4px 4px",
                                    border: "1px solid #404040",
                                    flex: 1,
                                }}
                                key={index}
                            >
                                {/* Loop for getting schedule data in current hour */}
                                {SCHEDULES.map((item, index) => (
                                    <ScheduleItem
                                        key={index}
                                        backgroundColor={item.backgroundColor}
                                        color={item.color}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

function ScheduleItem(props) {
    return (
        <div
            className="d-flex justify-content-between align-items-center"
            style={{
                padding: "4px 8px",
                backgroundColor: props.backgroundColor,
                color: props.color,
                borderRadius: 24,
                fontSize: 10,
            }}
        >
            <div className="font-weight-bold">Beginner</div>
            <div>4 slot(s) available</div>
        </div>
    );
}
