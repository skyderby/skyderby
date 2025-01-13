module Select2Helper
  def select2(value, from:)
    find("span[id^='select2-#{from}'][id$='-container']").click
    assert_selector '.select2-results'
    find('li.select2-results__option[role="option"]', text: value).click
  end
end
