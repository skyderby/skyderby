module PlacesHelper
  def place_name_by_id(id)
    return unless id

    Place.find_by(id: id)&.name
  end

  def place_presentation(place)
    return unless place

    country = place.country
    code_span = tag.span(class: 'text-warning', data: { controller: 'tooltip' }) do
      safe_join([(country.code || '').upcase, tag.span(country.name, class: 'for-screen-reader')])
    end

    name_span = tag.span do
      place.name
    end

    name_span
      .concat(' (')
      .concat(code_span)
      .concat(')')
  end
end
