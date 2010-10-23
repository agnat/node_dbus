exports.ok = function(response_) {
  return { state: 'OK' , response: response_};
}

exports.continue = function(response_) {
  return { state: 'CONTINUE' , response: response_};
}

exports.error = function(response_) {
  return { state: 'ERROR' };
}
