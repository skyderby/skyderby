module PlacesHelper
  def place_presentation(place)
    country = place.country
    code_span = content_tag(:span,
                            class: 'text-warning',
                            'data-toggle' => 'tooltip',
                            title: country.name) do
      country.code.upcase || ''
    end

    name_span = content_tag(:span) do
      ', ' + place.name
    end

    code_span.concat(name_span)
  end
end
