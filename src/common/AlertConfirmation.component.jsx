import { useEffect } from 'react';
import Swal from 'sweetalert2';

const AlertConfirmation = async ({ title, message }) => {
  const result = await Swal.fire({
    title: title,
    html: `<span className="fw-bolder fs-6">${message}</span>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#2B682A',
    cancelButtonColor: '#C14141',
    confirmButtonText: 'YES',
    cancelButtonText: 'NO',
    reverseButtons: true,
    customClass: {
      container: 'my-swal-container',
      popup: 'my-swal-popup',
    },
  });

  return result.isConfirmed;
};



export default AlertConfirmation;
