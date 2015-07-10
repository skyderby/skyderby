module WingsuitsHelper
  def suit_presentation(suit)
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
