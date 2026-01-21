module SuitsHelper
  def suit_name_by_id(id)
    return unless id

    Suit.find_by(id: id)&.name
  end

  def suit_presentation(suit)
    return unless suit

    manufacturer = suit.manufacturer
    code = tag.span(manufacturer.code,
                    class: 'text-warning', data: { controller: 'tooltip', tooltip: manufacturer.name })

    tag.span safe_join([code, suit.name], '&nbsp;'.html_safe)
  end
end
