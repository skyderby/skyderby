module EventsHelper
  def event_select_option(event)
    event ? [event.name, event.id] : nil
  end

  def competitor_color_by_index(index)
    colors = %w[#470FF4 #594E36 #F24C00 #AA3E98 #247BA0 #434348]
    colors[index % colors.length]
  end
end
