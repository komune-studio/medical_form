import {useEffect, useState} from 'react';
import moment from 'moment';
import {Button as AntButton, Flex} from 'antd';
import {CloseOutlined} from '@ant-design/icons';
import {Form} from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import Datetime from 'react-datetime';
import _ from 'lodash';
import Palette from 'utils/Palette';
import Iconify from 'components/reusable/Iconify';
import swal from 'components/reusable/CustomSweetAlert';
import UserModel from 'models/UserModel';
import ScheduleModel from 'models/ScheduleModel';
import ScheduleTable from './ScheduleTable';
import Helper from 'utils/Helper';

const SKILL_LEVEL = ['BEGINNER', 'ADVANCED', 'PRO', 'MAINTENANCE', 'EVENT'];

const SCHEDULES_GROUPING_BY_DATE_KEY_FORMAT = 'DD/MM/YYYY';

const MINUTES_PER_SESSION = 9;

export default function Schedule() {
    const [displayedSchedule, setDisplayedSchedule] = useState([]);
    const [modalSetting, setModalSetting] = useState({
        isOpen: false,
        isCreateMode: true,
    });
    const [currentTimeRange, setCurrentTimeRange] = useState({
        start_time: moment().day(0 + 1),
        end_time: moment()
            .day(0 + 1)
            .add(6, 'days'),
    });
    const [todaySchedule, setTodaySchedule] = useState([]);

    const getThisWeekSchedule = async () => {
        try {
            let result = await ScheduleModel.getAllInTimeRange({
                start_time: currentTimeRange.start_time.set({hour: 0, minute: 0, second: 0}).toString(),
                end_time: currentTimeRange.end_time.set({hour: 23, minute: 59, second: 59}).toString(),
            });

            // Group data by date
            let groupedResult = _.groupBy(result, (schedule) =>
                moment(schedule.start_time).format(SCHEDULES_GROUPING_BY_DATE_KEY_FORMAT)
            );

            setDisplayedSchedule(groupedResult);
        } catch (e) {
            console.log(e);
        }
    };

    const getTodaySchedule = async () => {
        try {
            let result = await ScheduleModel.getAllInTimeRange({
                start_time: moment().set({hour: 0, minute: 0, second: 0}).toString(),
                end_time: moment().set({hour: 23, minute: 59, second: 59}).toString(),
            });

            // Group data by date
            result.sort((a, b) => {
                if (moment(a.start_time).isSameOrBefore(moment(b.start_time))) {
                    return -1;
                } else {
                    return 1;
                }
            });

            console.log('TODAY SCHEDULE', result);
            setTodaySchedule(result);
        } catch (e) {
            console.log(e);
        }
    };

    const changeToNextWeek = () => {
        setCurrentTimeRange({
            start_time: currentTimeRange.start_time.add(7, 'days'),
            end_time: currentTimeRange.end_time.add(7, 'days'),
        });
    };

    const changeToPreviousWeek = () => {
        setCurrentTimeRange({
            start_time: currentTimeRange.start_time.subtract(7, 'days'),
            end_time: currentTimeRange.end_time.subtract(7, 'days'),
        });
    };

    useEffect(() => {
        getThisWeekSchedule();
    }, [currentTimeRange]);

    useEffect(() => {
        getTodaySchedule();
    }, [displayedSchedule]);

    return (
        <>
            <div
                className="container-fluid d-flex flex-column h-100"
                style={{color: '#FFF', fontFamily: 'Helixa', flex: 1}}
            >
                {/* Schedule title & pagination */}
                <div className="d-flex justify-content-between align-items-center">
                    {/* Schedule title */}
                    <div style={{fontSize: 20, fontWeight: 'bold'}}>Schedule</div>
                    {/* Schedule pagination & create button */}
                    <div
                        className="d-flex font-weight-bold align-items-center justify-content-center"
                        style={{fontSize: 12, gap: 8}}
                    >
                        <div>
                            <AntButton
                                type={'primary'}
                                onClick={() =>
                                    setModalSetting({
                                        isOpen: true,
                                        isCreateMode: true,
                                    })
                                }
                            >
                                Buat Sesi
                            </AntButton>
                        </div>
                        <div
                            className="d-flex align-items-center justify-content-center"
                            style={{
                                gap: 10,
                                padding: '6px 8px 6px 12px',
                                backgroundColor: Palette.LIGHT_GRAY,
                                borderRadius: 4,
                            }}
                        >
                            <div>{currentTimeRange.end_time.format('MMMM YY')}</div>
                            <div className="border" style={{borderRadius: 4, padding: '2px 8px'}}>
                                Week {currentTimeRange.end_time.weeks()} of {currentTimeRange.start_time.year()}
                            </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-center" style={{gap: 12}}>
                            <button className="btn p-0" onClick={changeToPreviousWeek}>
                                <Iconify icon="mdi:chevron-left" size={16} color="#FFF"/>
                            </button>
                            <button className="btn p-0" onClick={changeToNextWeek}>
                                <Iconify icon="mdi:chevron-right" size={16} color="#FFF"/>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Schedule table */}
                <div className="d-flex" style={{marginTop: 34, flex: 1}}>
                    <ScheduleTable
                        schedule={displayedSchedule}
                        currentTimeRange={currentTimeRange}
                        setModalSetting={setModalSetting}
                    />
                </div>
            </div>
            <ScheduleActionModal
                isOpen={modalSetting.isOpen}
                isCreateMode={modalSetting.isCreateMode}
                scheduleData={modalSetting?.scheduleData || null}
                handleClose={() => setModalSetting({...modalSetting, isOpen: false})}
                refreshData={getThisWeekSchedule}
                todaySchedule={todaySchedule}
            />
        </>
    );
}

function ScheduleActionModal({isOpen, isCreateMode, scheduleData, handleClose, refreshData, todaySchedule}) {
    const [createFormData, setCreateFormData] = useState({
        start_time: new Date(),
        duration_minutes: 10,
        skill_level: '',
        available_slots: 10,
    });
    const [registerFormData, setRegisterFormData] = useState('');
    const [registeredDriversList, setRegisteredDriversList] = useState([]);
    const [updateFormData, setUpdateFormData] = useState({});

    const getRegisteredDriversList = async () => {
        try {
            const initialArray = new Array(scheduleData.available_slots || 0).fill(0);
            let drivers = await ScheduleModel.getById(scheduleData.id);

            drivers.schedule_slot_user.forEach((driver, index) => {
                initialArray[index] = driver;
            });

            setRegisteredDriversList(initialArray);
        } catch (e) {
            console.log(e);
        }
    };

    const getModalHeaderTitle = () => {
        const scheduleDataMoment = moment(scheduleData?.start_time);
        const title = Helper.toTitleCase(scheduleData?.skill_level);
        const scheduleDate = scheduleDataMoment.format('dddd, DD MMMM YYYY');
        const scheduleStartTime = scheduleDataMoment.format('HH:mm');
        const scheduleEndTime = scheduleDataMoment.add(scheduleData?.duration_minutes, 'minute').format('HH:mm');

        return `${title} Session (${scheduleDate} / ${scheduleStartTime} - ${scheduleEndTime})`;
    };

    const resetCreateForm = () => {
        let startTime = moment();
        if (startTime.hour() < 10) {
            startTime.set({hour: 10, minute: 0, second: 0});
        }


        for (let i = 0; i < todaySchedule.length; i++) {
            let currentScheduleStartTime = moment(todaySchedule[i].start_time);
            let currentScheduleEndTime = moment(todaySchedule[i].start_time).add(
                todaySchedule[i].duration_minutes,
                'minutes'
            );

            if (currentScheduleEndTime.isBefore(startTime, 'minute')) {
                continue;
            }

            if (
                currentScheduleStartTime.isAfter(startTime, 'minute') &&
                currentScheduleStartTime.diff(startTime, 'minute') >= MINUTES_PER_SESSION
            ) {
                break;
            } else {
                startTime = currentScheduleEndTime;
            }
        }

        setCreateFormData({
            start_time: startTime,
            duration_minutes: 10,
            skill_level: '',
            available_slots: 10,
        });
    };

    const resetRegisterForm = () => {
        setRegisterFormData('');
    };

    const resetAllForms = () => {
        resetCreateForm();
        resetRegisterForm();
        setRegisteredDriversList([]);
    };

    const handleRegisterFormInputChange = async (value) => {
        try {
            setRegisterFormData(value);

            let getUserData;
            clearTimeout(getUserData);

            getUserData = setTimeout(async () => {
                if (value.length > 100) {
                    let result = await UserModel.processUserQR({
                        token: value,
                    });
                    handleRegisterFormSubmit(result);
                    setTimeout(() => setRegisterFormData(''), 300);
                }
            }, 300);
        } catch (e) {
            swal.fireError({
                title: `Error`,
                text: e.error_message ? e.error_message : 'Invalid credential, please try again.',
            });
        }
    };

    const handleUpdateDriverCheckboxInputChange = async (value, index) => {
        try {
            if (!value) {
                setRegisteredDriversList(
                    registeredDriversList.map((driver, driverIndex) => {
                        if (driverIndex <= index && !driver) {
                            return {
                                schedule_slot_id: scheduleData.id,
                                apex_nickname: (driverIndex + 1).toString(),
                                user_id: null,
                            };
                        } else {
                            return driver;
                        }
                    })
                );
            } else {
                setRegisteredDriversList(
                    registeredDriversList.map((driver, driverIndex) => {
                        if (driverIndex >= index) {
                            return 0;
                        } else {
                            return driver;
                        }
                    })
                );
            }
        } catch (e) {
            console.log(e);
            swal.fireError({
                title: `Error`,
                text: e.error_message ? e.error_message : 'Failed to register driver(s), please try again.',
            });
        }
    };

    const handleUpdateDriverTextInputChange = (value, index) => {
        setRegisteredDriversList(
            registeredDriversList.map((driver, driverIndex) => {
                if (driverIndex === index) {
                    return value;
                } else {
                    return driver;
                }
            })
        );
    };

    const handleCreateFormSubmit = async () => {
        try {
            await ScheduleModel.create({
                ...createFormData,
                duration_minutes: parseInt(createFormData.duration_minutes),
                available_slots: parseInt(createFormData.available_slots),
            });
            swal.fire({
                text: 'Sesi Balapan berhasil dibuat!',
                icon: 'success',
            });
            resetCreateForm();
            handleClose();
            refreshData();
        } catch (e) {
            console.log(e);
            swal.fireError({
                title: `Error`,
                text: e.error_message ? e.error_message : 'Failed to create new session, please try again.',
            });
        }
    };

    const handleRegisterFormSubmit = async (userData = null) => {
        try {
            await ScheduleModel.registerDriver({
                schedule_slot_id: scheduleData.id,
                apex_nickname: userData?.apex_data?.nickname || registerFormData,
                user_id: userData?.id || null,
            });

            getRegisteredDriversList();
            resetRegisterForm();
            refreshData();
        } catch (e) {
            console.log(e);
            swal.fireError({
                title: `Error`,
                text: e.error_message ? e.error_message : 'Failed to register drivers, please try again.',
                focusConfirm: true,
            });
        }
    };

    const handleUpdateScheduleFormSubmit = async () => {
        try {
            await ScheduleModel.edit({
                ...updateFormData,
                duration_minutes: parseInt(updateFormData.duration_minutes),
                schedule_slot_id: parseInt(updateFormData.id),
                available_slots: parseInt(updateFormData.available_slots),
            });
            swal.fire({
                text: 'Sesi Balapan berhasil diubah!',
                icon: 'success',
            });
            refreshData();
        } catch (e) {
            console.log(e);
            swal.fireError({
                title: `Error`,
                text: e.error_message ? e.error_message : 'Gagal untuk mengubah jadwal, silahkan coba lagi',
            });
        }
    };

    const hanldeUpdateDriverFormSubmit = async () => {
        try {
            let lastSavedData = await ScheduleModel.getById(scheduleData.id);

            for (let i = 0; i < registeredDriversList.length; i++) {
                let currentDriver = registeredDriversList[i];
                if (!currentDriver) {
                    continue;
                }

                if (!currentDriver.id) {
                    await ScheduleModel.registerDriver(currentDriver);
                } else {
                    for (let j = 0; j < lastSavedData.schedule_slot_user.length; j++) {
                        if (currentDriver.id === lastSavedData.schedule_slot_user[j].id) {
                            await ScheduleModel.editRegisteredDriver(currentDriver);
                            lastSavedData.schedule_slot_user.splice(j, 1);
                            break;
                        }
                    }
                }
            }

            for (let i = 0; i < lastSavedData.schedule_slot_user.length; i++) {
                await handleUnregisterDriver(lastSavedData.schedule_slot_user[i].id);
            }

            getRegisteredDriversList();
            refreshData();

            swal.fire({
                text: 'Informasi driver berhasil diubah!',
                icon: 'success',
            });
        } catch (e) {
            console.log(e);
            swal.fireError({
                title: `Error`,
                text: e.error_message ? e.error_message : 'Failed to update registered driver(s), please try again.',
            });
        }
    };

    const handleUnregisterDriver = async (driverId) => {
        try {
            await ScheduleModel.unregisterDriver(driverId);
            getRegisteredDriversList();
            refreshData();
        } catch (e) {
            console.log(e);
            swal.fireError({
                title: `Error`,
                text: e.error_message ? e.error_message : 'Failed to unregister driver, please try again.',
            });
        }
    };

    const handleDeleteSchedule = async () => {
        try {
            await ScheduleModel.hardDelete(scheduleData?.id);
            swal.fire({
                text: 'Sesi Balapan berhasil dihapus!',
                icon: 'success',
            });
            refreshData();
        } catch (e) {
            console.log(e);
            swal.fireError({
                title: `Error`,
                text: e.error_message ? e.error_message : 'Gagal untuk menghapus jadwal, silahkan coba lagi',
            });
        }
    };

    useEffect(() => {
        if (scheduleData) {
            setUpdateFormData(scheduleData);
            getRegisteredDriversList();
        }
    }, [scheduleData]);

    useEffect(() => {
        resetAllForms();

        if (isOpen && !isCreateMode) {
            getRegisteredDriversList();
        }
    }, [isOpen, isCreateMode]);

    return (
        <Modal size={'lg'} show={isOpen} backdrop="static" keyboard={false}>
            <Modal.Header>
                <div className={'d-flex w-100 justify-content-between'}>
                    <Modal.Title>{isCreateMode ? 'Buat Sesi' : getModalHeaderTitle()}</Modal.Title>
                    <AntButton
                        onClick={() => {
                            resetAllForms();
                            handleClose();
                        }}
                        style={{
                            position: 'relative',
                            top: -5,
                            color: '#fff',
                            fontWeight: 800,
                        }}
                        type="link"
                        shape="circle"
                        icon={<CloseOutlined/>}
                    />
                </div>
            </Modal.Header>
            <Modal.Body>
                <Flex vertical gap={12}>
                    {isCreateMode ? (
                        // Create new race schedule form
                        <>
                            <Flex vertical gap={8}>
                                <Form.Label>Waktu Mulai</Form.Label>
                                <Datetime
                                    value={createFormData.start_time}
                                    onChange={(value) =>
                                        setCreateFormData({
                                            ...createFormData,
                                            start_time: value.toDate(),
                                        })
                                    }
                                    timeConstraints={{
                                        hours: {min: 10, max: 22},
                                    }}
                                />
                            </Flex>
                            <Flex vertical gap={8}>
                                <Form.Label>Durasi (menit)</Form.Label>
                                <Form.Control
                                    placeholder={10}
                                    type="number"
                                    value={createFormData.duration_minutes}
                                    onChange={(e) =>
                                        setCreateFormData({
                                            ...createFormData,
                                            duration_minutes: e.target.value,
                                        })
                                    }
                                />
                            </Flex>
                            <Flex vertical gap={8}>
                                <Form.Label>Level Skill</Form.Label>
                                <Form.Select
                                    className="form-control"
                                    value={createFormData.skill_level}
                                    onChange={(e) =>
                                        setCreateFormData({
                                            ...createFormData,
                                            skill_level: e.target.value,
                                        })
                                    }
                                >
                                    <option hidden></option>
                                    {SKILL_LEVEL.map((skill) => (
                                        <option key={skill} value={skill}>
                                            {skill}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Flex>
                            <Flex vertical gap={8}>
                                <Form.Label>Slot Tersedia</Form.Label>
                                <Form.Control
                                    placeholder={10}
                                    type="number"
                                    value={createFormData.available_slots}
                                    onChange={(e) =>
                                        setCreateFormData({
                                            ...createFormData,
                                            available_slots: e.target.value,
                                        })
                                    }
                                />
                            </Flex>
                        </>
                    ) : (
                        // Driver Registration & Race Session Editing Form
                        <>
                            {/* Race Session Edit Form */}
                            <Flex vertical gap={8}>
                                <Flex vertical gap={8}>
                                    <Form.Label>Waktu Mulai</Form.Label>
                                    <Datetime
                                        value={moment(updateFormData?.start_time).toDate()}
                                        onChange={(value) =>
                                            setUpdateFormData({
                                                ...updateFormData,
                                                start_time: value.toDate(),
                                            })
                                        }
                                        timeConstraints={{
                                            hours: {min: 10, max: 22},
                                        }}
                                    />
                                </Flex>
                                <Flex vertical gap={8}>
                                    <Form.Label>Durasi (menit)</Form.Label>
                                    <Form.Control
                                        placeholder={10}
                                        type="number"
                                        value={updateFormData?.duration_minutes}
                                        onChange={(e) =>
                                            setUpdateFormData({
                                                ...updateFormData,
                                                duration_minutes: e.target.value,
                                            })
                                        }
                                    />
                                </Flex>
                                <Flex vertical gap={8}>
                                    <Form.Label>Level Skill</Form.Label>
                                    <Form.Select
                                        className="form-control"
                                        value={updateFormData?.skill_level}
                                        onChange={(e) =>
                                            setUpdateFormData({
                                                ...updateFormData,
                                                skill_level: e.target.value,
                                            })
                                        }
                                    >
                                        {SKILL_LEVEL.map((skill) => (
                                            <option key={skill} value={skill}>
                                                {skill}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Flex>
                                <Flex vertical gap={8}>
                                    <Form.Label>Slot Tersedia</Form.Label>
                                    <Form.Control
                                        placeholder={10}
                                        type="number"
                                        value={updateFormData?.available_slots}
                                        onChange={(e) =>
                                            setUpdateFormData({
                                                ...updateFormData,
                                                available_slots: e.target.value,
                                            })
                                        }
                                    />
                                </Flex>
                                <Flex justify="end" style={{marginTop: 18}}>
                                    <AntButton
                                        type={'primary'}
                                        onClick={() => {
                                            handleUpdateScheduleFormSubmit();
                                            handleClose();
                                        }}
                                    >
                                        Ubah
                                    </AntButton>
                                </Flex>
                            </Flex>

                            {/* Driver Regisration Form */}
                            {scheduleData.skill_level !== 'EVENT' && scheduleData.skill_level !== 'MAINTENANCE' ? (
                                <>
                                    <Flex vertical gap={8} style={{marginTop: 24}}>
                                        <Form.Label style={{fontWeight: 400}}>Daftarkan Driver</Form.Label>
                                        <Flex gap={8}>
                                            <Form.Control
                                                value={registerFormData}
                                                placeholder={'Scan QR atau masukkan nickname user'}
                                                onChange={(e) => handleRegisterFormInputChange(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleRegisterFormSubmit();
                                                    }
                                                }}
                                            />
                                            <AntButton
                                                type={'primary'}
                                                disabled={!registerFormData}
                                                onClick={handleRegisterFormSubmit}
                                            >
                                                Daftarkan
                                            </AntButton>
                                        </Flex>
                                    </Flex>
                                    {/* Registered Drivers List */}
                                    {registeredDriversList.length > 0 ? (
                                        <Flex vertical gap={8}>
                                            <div
                                                style={{
                                                    color: '#FFF',
                                                    fontWeight: 700,
                                                    marginTop: 24,
                                                }}
                                            >
                                                List Driver
                                            </div>
                                            {registeredDriversList.map((driver, index) => (
                                                <DriversListItemComponent
                                                    key={driver.id}
                                                    driver={registeredDriversList[index]}
                                                    handleCheckboxInputChange={handleUpdateDriverCheckboxInputChange}
                                                    handleTextInputChange={handleUpdateDriverTextInputChange}
                                                    index={index}
                                                />
                                            ))}
                                        </Flex>
                                    ) : null}
                                    <Flex justify={'end'}>
                                        <AntButton type={'primary'} onClick={hanldeUpdateDriverFormSubmit}>
                                            Perbaharui Data
                                        </AntButton>
                                    </Flex>
                                </>
                            ) : null}
                        </>
                    )}
                </Flex>

                {/* Close modal button */}
                <Flex className="mt-5" justify={'end'} align={'center'} gap={8}>
                    {isCreateMode ? (
                        <AntButton
                            type={'primary'}
                            size="sm"
                            variant="primary"
                            onClick={() => {
                                handleCreateFormSubmit();
                            }}
                        >
                            Buat sesi
                        </AntButton>
                    ) : (
                        <AntButton
                            type={'primary'}
                            onClick={() => {
                                handleDeleteSchedule();
                                handleClose();
                            }}
                            danger
                        >
                            Hapus Jadwal
                        </AntButton>
                    )}
                </Flex>
            </Modal.Body>
        </Modal>
    );
}

function DriversListItemComponent({driver, handleCheckboxInputChange, handleTextInputChange, index}) {
    return (
        <Flex justify="center" align="center" gap={12}>
            <Flex gap={12}>
                <div>
                    <input
                        type="checkbox"
                        checked={driver}
                        value={driver?.apex_nickname || ''}
                        onChange={(e) => {
                            handleCheckboxInputChange(e.target.value, index);
                        }}
                    />
                </div>
                <div style={{color: '#FFF'}}>{index + 1}.</div>
            </Flex>
            <Form.Control
                value={driver?.apex_nickname || ''}
                onChange={(e) => handleTextInputChange({...driver, apex_nickname: e.target.value}, index)}
                disabled={!driver}
            />
        </Flex>
    );
}
