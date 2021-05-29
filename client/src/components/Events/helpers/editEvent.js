const axios = require('axios');

const editEvent = function (id, path, data) {
  if (path === 'delete') {
    return axios.delete(`/events/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.log('ERROR: ', err);
    });
  }
  if (path === "edit") {
    return axios.put(`/events/${id}`, {data: data})
    .then((res) => {
      console.log(Array.isArray(res.data))
      return res.data[0]
    })
    .catch((err) => {
      console.log('ERROR: ', err);
    });
  }
};

export default editEvent;