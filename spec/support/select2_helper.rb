module Select2Helper
  def select2(value, from:)
    sleep 0.1
    find("span[id^='select2-#{from}'][id$='-container']").click
    sleep 0.1
    find('li.select2-results__option[role="option"]', text: value).click
  end
end
