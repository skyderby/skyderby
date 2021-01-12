module SponsorsHelper
  def new_sponsor_link(sponsorable)
    title = tag.i(nil, class: 'fa fa-plus')
               .concat(' ')
               .concat(t('sponsors.list.add_sponsor'))

    link_to(title,
            polymorphic_path([:new, sponsorable, :sponsor]),
            remote: true,
            class: 'add-sponsor button button--minimal')
  end

  def copy_sponsors_link(sponsorable)
    title = tag.i(nil, class: 'fa fa-copy')
               .concat(' ')
               .concat(t('sponsors.list.copy_sponsor'))

    link_to(title,
            polymorphic_path([:new, sponsorable, :sponsors_copy]),
            remote: true,
            class: 'button button--minimal')
  end
end
