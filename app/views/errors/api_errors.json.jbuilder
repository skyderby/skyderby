json.errors do |json|
  json.array! errors.messages.map { |_, messages| messages }
end
