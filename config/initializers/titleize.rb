module TitleizeUnicode
  def titleize(**)
    split.map(&:capitalize).join(' ')
  end
end

String.prepend(TitleizeUnicode)
