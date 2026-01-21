module HotSelectHelper
  def hot_select_options_container(as: :popover, **attrs, &)
    if as == :template
      tag.template(**attrs, &)
    else
      tag.div(class: 'hot-select-dropdown', role: 'listbox', popover: '', **attrs, &)
    end
  end

  def omni_search_type_options(&)
    render 'hot_select/local_options', as: :template, 'data-omni-search-target': 'typeSelect', &
  end

  def omni_search_local_options(name:, options:)
    render 'hot_select/local_options', as: :template, options:, 'data-omni-search-target': 'model', 'data-name': name
  end

  def omni_search_async_options(src:, select_id:, name:)
    render 'hot_select/async_options', as: :template, controller: 'omni-search', src:, select_id:,
                                       'data-omni-search-target': 'model', 'data-name': name
  end
end
