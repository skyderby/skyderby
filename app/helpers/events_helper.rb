module EventsHelper
  def display_event_form_params
    capture do
      display_event_params.each do |key, value|
        concat hidden_field_tag key, value
      end
    end
  end

  def event_select_option(event)
    event ? [event.name, event.id] : nil
  end

  def competitor_color_by_index(index)
    colors = %w[#7cb5ec #f7a35c #8085e9 #f15c80 #e4d354 #8085e8 #8d4653 #91e8e1 #90ed7d #434348]
    colors[index % colors.length]
  end
end
