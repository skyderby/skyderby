export default {
  theme: 'bootstrap',
  containerCssClass: ':all:',
  width: '100%',
  allowClear: true,
  ajax: {
    dataType: 'json',
    type: "GET",
    quietMillis: 50,
    data: (params) => {
      return {
        query: params.term,
        page: params.page
      }
    },
    cache: true
  }
}
