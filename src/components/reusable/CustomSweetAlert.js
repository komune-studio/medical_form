import sweetalert from "sweetalert2";
import Palette from "utils/Palette";

const swal = {
    fire: (options) => {
        return sweetalert.fire({
            ...options,
            confirmButtonColor: Palette.MAIN_THEME,
            customClass: {
                container: 'swal-fonts',
                ...options.customClass,
            }
        })
    },
    fireError : (options) => {
        return sweetalert.fire({
            title: 'Error',
            icon: 'error',
            confirmButtonText: 'Okay',
            confirmButtonColor: Palette.MAIN_THEME,
            customClass: {
                container: 'swal-fonts',
                ...options.customClass,
            },
            ...options,
        })
    },
}

export default swal;