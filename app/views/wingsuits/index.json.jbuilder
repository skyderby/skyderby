json.array! @wingsuits do |wingsuit|
  json.id   wingsuit.id
  json.name wingsuit.name
  json.manufacturer do |json|
    json.id wingsuit.manufacturer_id
    json.name wingsuit.manufacturer_name
  end
end
