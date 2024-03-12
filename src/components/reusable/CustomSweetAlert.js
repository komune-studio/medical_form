import sweetalert from "sweetalert2";

const swal = {
    fire: (options) => {
        return sweetalert.fire({
            ...options,
            confirmButtonColor: 'rgb(255,109,198)',
            customClass: {
                container: 'swal-font',
                ...options.customClass,
            }
        })
    },
    fireError : (options) => {
        return sweetalert.fire({
            title: 'Error',
            icon: 'error',
            confirmButtonText: 'Okay',
            confirmButtonColor: 'rgb(255,109,198)',
            customClass: {
                container: 'swal-font',
                ...options.customClass,
            },
            ...options,
        })
    },
}

export default swal;