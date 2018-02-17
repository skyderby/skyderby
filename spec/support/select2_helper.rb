module Select2Helper
  def select2(value, from:)
    find("#select2-#{from}-container").click
    sleep 0.1
    find('li.select2-results__option', text: value, match: :prefer_exact).click
  end
end
