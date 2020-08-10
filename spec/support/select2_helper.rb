module Select2Helper
  def select2(value, from:)
    3.times do
      find("span[id^='select2-#{from}'][id$='-container']").click

      break if page.has_css?('.select2-results')
    end

    find('li.select2-results__option[role="option"]', text: value).click
  end
end
