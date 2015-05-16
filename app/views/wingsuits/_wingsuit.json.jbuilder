json.extract! wingsuit, :id, :name
json.manufacturer do |json|
  json.extract! wingsuit.manufacturer, :id, :name
end
