module SuitsHelper
  def suit_name_by_id(id)
    return unless id

    Suit.find_by(id: id)&.name
  end

  def suit_presentation(suit)
    return unless suit

    manufacturer = suit.manufacturer
    code_span = content_tag(:span,
                            class: 'text-warning',
                            'data-toggle' => 'tooltip',
                            title: manufacturer.name) do
      manufacturer.code || ''
    end

    name_span = content_tag(:span) do
      ' ' + suit.name
    end

    code_span.concat(name_span)
  end
end
