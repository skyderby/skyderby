module Select2Helper
  def select2(value, from:)
    find("#select2-#{from}-container").click
    sleep 0.1
    find('li.select2-results__option[role="treeitem"]', text: value).click
  end
end
