module Select2Helper
  def select2(value, from:)
    find("span[id^='select2-#{from}'][id$='-container']").click
    expect(page).to have_css('.select2-results')
    find('li.select2-results__option[role="option"]', text: value).click
  end
end
