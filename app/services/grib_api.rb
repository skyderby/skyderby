require 'ffi'
require 'logger'

module GribApi
  module Stdio
    extend FFI::Library
    ffi_lib FFI::Library::LIBC

    typedef :pointer, :file_pointer
    attach_function :fopen, [:string, :string], :file_pointer
    attach_function :fclose, [:file_pointer], :int
  end

  extend FFI::Library

  # requires adding the path to the eccodes library to the LD_LIBRARY_PATH
  # export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$(brew --prefix eccodes)/share
  # or:
  # export LD_LIBRARY_PATH="$(brew --prefix eccodes)/share"
  ffi_lib 'eccodes'

  typedef :pointer, :grib_context_p
  typedef :pointer, :grib_handle_p

  GRIB_SUCCESS = 0

  class GribError < StandardError; end
  class EndOfFile < GribError; end
  class InternalError < GribError; end
  class BufferTooSmall < GribError; end
  class NotImplemented < GribError; end
  class Missing7777 < GribError; end
  class ArrayTooSmall < GribError; end
  class FileNotFound < GribError; end
  class CodeNotFoundInTable < GribError; end
  class WrongArraySize < GribError; end
  class NotFound < GribError; end
  class IoProblem < GribError; end
  class InvalidMessage < GribError; end
  class DecodingError < GribError; end
  class EncodingError < GribError; end
  class NoMoreInSet < GribError; end
  class GeocalculusProblem < GribError; end
  class OutOfMemory < GribError; end
  class ReadOnly < GribError; end
  class InvalidArgument < GribError; end
  class NullHandle < GribError; end
  class InvalidSectionNumber < GribError; end
  class ValueCannotBeMissing < GribError; end
  class WrongLength < GribError; end
  class InvalidType < GribError; end
  class WrongStep < GribError; end
  class WrongStepUnit < GribError; end
  class InvalidFile < GribError; end
  class InvalidGrib < GribError; end
  class InvalidIndex < GribError; end
  class InvalidIterator < GribError; end
  class InvalidKeysIterator < GribError; end
  class InvalidNearest < GribError; end
  class InvalidOrderby < GribError; end
  class MissingKey < GribError; end
  class OutOfArea < GribError; end
  class ConceptNoMatch < GribError; end
  class HashArrayNoMatch < GribError; end
  class NoDefinitions < GribError; end
  class WrongType < GribError; end
  class EndOfResource < GribError; end
  class NoValues < GribError; end
  class WrongGrid < GribError; end
  class EndOfIndex < GribError; end
  class NullIndex < GribError; end
  class PrematureEndOfFile < GribError; end
  class InternalArrayTooSmall < GribError; end
  class MessageTooLarge < GribError; end
  class ConstantField < GribError; end
  class SwitchNoMatch < GribError; end
  class Underflow < GribError; end
  class MessageMalformed < GribError; end
  class CorruptedIndex < GribError; end
  class InvalidBpv < GribError; end
  class DifferentEdition < GribError; end
  class ValueDifferent < GribError; end
  class InvalidKeyValue < GribError; end
  class StringTooSmall < GribError; end
  class WrongConversion < GribError; end
  class MissingBufrEntry < GribError; end
  class NullPointer < GribError; end
  class AttributeClash < GribError; end
  class TooManyAttributes < GribError; end
  class AttributeNotFound < GribError; end
  class UnsupportedEdition < GribError; end
  class OutOfRange < GribError; end
  class WrongBitmapSize < GribError; end
  class FunctionalityNotEnabled < GribError; end
  class ValueMismatch < GribError; end
  class DoubleValueMismatch < GribError; end
  class LongValueMismatch < GribError; end
  class ByteValueMismatch < GribError; end
  class StringValueMismatch < GribError; end
  class OffsetMismatch < GribError; end
  class CountMismatch < GribError; end
  class NameMismatch < GribError; end
  class TypeMismatch < GribError; end
  class TypeAndValueMismatch < GribError; end
  class UnableToCompareAccessors < GribError; end
  class AssertionFailure < GribError; end

  ERROR_CODE_TO_EXCEPTION = {
    -1 => EndOfFile,
    -2 => InternalError,
    -3 => BufferTooSmall,
    -4 => NotImplemented,
    -5 => Missing7777,
    -6 => ArrayTooSmall,
    -7 => FileNotFound,
    -8 => CodeNotFoundInTable,
    -9 => WrongArraySize,
    -10 => NotFound,
    -11 => IoProblem,
    -12 => InvalidMessage,
    -13 => DecodingError,
    -14 => EncodingError,
    -15 => NoMoreInSet,
    -16 => GeocalculusProblem,
    -17 => OutOfMemory,
    -18 => ReadOnly,
    -19 => InvalidArgument,
    -20 => NullHandle,
    -21 => InvalidSectionNumber,
    -22 => ValueCannotBeMissing,
    -23 => WrongLength,
    -24 => InvalidType,
    -25 => WrongStep,
    -26 => WrongStepUnit,
    -27 => InvalidFile,
    -28 => InvalidGrib,
    -29 => InvalidIndex,
    -30 => InvalidIterator,
    -31 => InvalidKeysIterator,
    -32 => InvalidNearest,
    -33 => InvalidOrderby,
    -34 => MissingKey,
    -35 => OutOfArea,
    -36 => ConceptNoMatch,
    -37 => HashArrayNoMatch,
    -38 => NoDefinitions,
    -39 => WrongType,
    -40 => EndOfResource,
    -41 => NoValues,
    -42 => WrongGrid,
    -43 => EndOfIndex,
    -44 => NullIndex,
    -45 => PrematureEndOfFile,
    -46 => InternalArrayTooSmall,
    -47 => MessageTooLarge,
    -48 => ConstantField,
    -49 => SwitchNoMatch,
    -50 => Underflow,
    -51 => MessageMalformed,
    -52 => CorruptedIndex,
    -53 => InvalidBpv,
    -54 => DifferentEdition,
    -55 => ValueDifferent,
    -56 => InvalidKeyValue,
    -57 => StringTooSmall,
    -58 => WrongConversion,
    -59 => MissingBufrEntry,
    -60 => NullPointer,
    -61 => AttributeClash,
    -62 => TooManyAttributes,
    -63 => AttributeNotFound,
    -64 => UnsupportedEdition,
    -65 => OutOfRange,
    -66 => WrongBitmapSize,
    -67 => FunctionalityNotEnabled,
    -68 => ValueMismatch,
    -69 => DoubleValueMismatch,
    -70 => LongValueMismatch,
    -71 => ByteValueMismatch,
    -72 => StringValueMismatch,
    -73 => OffsetMismatch,
    -74 => CountMismatch,
    -75 => NameMismatch,
    -76 => TypeMismatch,
    -77 => TypeAndValueMismatch,
    -78 => UnableToCompareAccessors,
    -79 => AssertionFailure
  }.freeze

  def self.assert_return_code(status, message = nil)
    return if status == GRIB_SUCCESS

    raise ERROR_CODE_TO_EXCEPTION[status], message
  end

  # @!method grib_context_get_default
  # Get the static default context
  #
  # @return [FFI::Pointer] the default context, NULL it the context is not available
  attach_function :grib_context_get_default, [], :grib_context_p

  # @!method grib_context_delete
  # Frees the cached definition files of the context
  #
  # @param c [FFI::Pointer] the context to be deleted
  #   grib_context* c
  # @return [nil] void
  attach_function :grib_context_delete, [:grib_context_p], :void

  # NULL is the default context to be used in the following functions
  def self.default_context = FFI::Pointer.new(0)

  # @!method grib_handle_new_from_file
  # Create a handle from a file resource.
  # The file is read until a message is found. The message is then copied.
  # Remember always to delete the handle when it is not needed anymore to avoid
  # memory leaks.
  #
  # @param c [FFI::Pointer] the context from which the handle will be created (NULL for default context)
  # @param f [FFI::Pointer] the file resource
  # @param error [FFI::Pointer] pointer to integer.
  #              error code set if the returned handle is NULL and the end of file is not reached
  # @return [FFI::Pointer] the new handle, NULL if the resource is invalid or a problem is encountered
  def self.grib_handle_new_from_file(file_pointer, context = GribApi.default_context)
    status = FFI::MemoryPointer.new(:int)
    handle = _grib_handle_new_from_file(context, file_pointer, status)
    GribApi.assert_return_code(status.read_int, 'Error creating handle from file')

    handle
  end
  attach_function :_grib_handle_new_from_file,
                  :grib_handle_new_from_file,
                  [:pointer, :pointer, :pointer],
                  :grib_handle_p

  # @!method grib_handle_delete
  # Frees a handle, also frees the message if it is not a user message
  #
  # @param h [FFI::Pointer] The handle to be deleted
  #   grib_handle* h
  # @return [Integer] 0 if OK, integer value on error
  def self.grib_handle_delete(handle)
    status = _grib_handle_delete(handle)
    GribApi.assert_return_code(status, 'Error deleting handle')
  end
  attach_function :_grib_handle_delete, :grib_handle_delete, [:grib_handle_p], :int

  # @!method grib_count_in_file
  # Counts the messages contained in a file resource.
  #
  # @param c [FFI::Pointer] the context from which the handle will be created (NULL for default context)
  # @param f [FFI::Pointer] the file resource
  # @param n [FFI::Pointer] the number of messages in the file
  # @return [Integer] 0 if OK, integer value on error
  def self.grib_count_in_file(file_pointer, context = GribApi.default_context)
    count_pointer = FFI::MemoryPointer.new(:int)
    status = _grib_count_in_file(context, file_pointer, count_pointer)
    GribApi.assert_return_code(status, 'Error counting messages in file')

    count_pointer.read_int
  end
  attach_function :_grib_count_in_file, :grib_count_in_file, [:grib_context_p, :pointer, :pointer], :int

  # @!method grib_get_data
  # Get latitude/longitude and data values.
  # The latitudes, longitudes and values arrays must be properly allocated by the caller.
  # Their required dimension can be obtained by getting the value of the integer key "numberOfPoints".
  #
  # int grib_get_data(const grib_handle* h, double* lats, double* lons, double* values);
  #
  # @param handle [FFI::Pointer] handle from which geography and data values are taken
  # @return [DataResult] the data result
  def self.grib_get_data(handle)
    length = GribApi.grib_get_long(handle, 'numberOfPoints')
    lats = FFI::MemoryPointer.new(:double, length)
    lons = FFI::MemoryPointer.new(:double, length)
    values = FFI::MemoryPointer.new(:double, length)

    status = _grib_get_data(handle, lats, lons, values)
    GribApi.assert_return_code(status, 'Error getting data')

    DataResult.new(
      lats: lats.read_array_of_double(length),
      lons: lons.read_array_of_double(length),
      values: values.read_array_of_double(length)
    )
  end
  attach_function :_grib_get_data, :grib_get_data, [:grib_handle_p, :pointer, :pointer, :pointer], :int

  # @!method grib_get_long
  # Get a long value from a key, if several keys of the same name are present, the last one is returned
  #
  # @param h [FFI::Pointer] the handle to get the data from
  #   const grib_handle* h
  # @param key [String] the key to be searched
  #   const char* key
  # @param value [FFI::Pointer] the address of a long where the data will be retrieved
  #   long* value
  # @return [Integer] 0 if OK, integer value on error
  def self.grib_get_long(handle, key)
    value = FFI::MemoryPointer.new(:long)
    status = _grib_get_long(handle, key, value)
    GribApi.assert_return_code(status, "Error getting long from key: #{key}")

    value.read_long
  end
  attach_function :_grib_get_long, :grib_get_long, [:grib_handle_p, :string, :pointer], :int

  # @!method grib_get_double
  # Get a double value from a key, if several keys of the same name are present, the last one is returned
  #
  # @param handle [FFI::Pointer] the handle to get the data from
  # @param key [String] the key to be searched
  # @return [Numeric] the value of the key
  def self.grib_get_double(handle, key)
    value = FFI::MemoryPointer.new(:double)
    status = _grib_get_double(handle, key, value)
    GribApi.assert_return_code(status, "Error getting double from key: #{key}")

    value.read_double
  end
  attach_function :_grib_get_double, :grib_get_double, [:grib_handle_p, :string, :pointer], :int

  # @!method grib_get_string
  # Get a string value from a key. If several keys of the same name are present, the last one is returned.
  #
  # @param h [FFI::Pointer] the handle to get the data from
  #   const grib_handle* h
  # @param key [String] the key to be searched
  #   const char* key
  # @param mesg [FFI::Pointer] the address of a string where the data will be retrieved
  # @param length [Integer] allocated length of the string
  # @return [String] the value of the key
  def self.grib_get_string(handle, key, length = 1024)
    size = FFI::MemoryPointer.new(:size_t)
    size.write_int(length)
    value = FFI::MemoryPointer.new(:char, length)
    status = _grib_get_string(handle, key, value, size)
    GribApi.assert_return_code(status, "Error getting string from key: #{key}")

    value.read_string
  end
  attach_function :_grib_get_string, :grib_get_string, [:grib_handle_p, :string, :pointer, :pointer], :int

  # ###
  # The keys iterator is designed to get the key names defined in a message.
  # Key names on which the iteration is carried out can be filtered through their
  # attributes or by the namespace they belong to.

  # @!method grib_keys_iterator_new
  # Create a new iterator from a valid and initialised handle.
  #
  # @param h             : the handle whose keys you want to iterate
  # @param filter_flags  : flags to filter out some of the keys through their attributes
  # @param name_space [String] if not null the iteration is carried out only on
  #   keys belonging to the namespace passed. (NULL for all the keys)
  #   https://confluence.ecmwf.int/display/UDOC/What+are+namespaces+-+ecCodes+GRIB+FAQ
  # @return              keys iterator ready to iterate through keys according to filter_flags
  #                      and namespace
  # grib_keys_iterator* grib_keys_iterator_new(grib_handle* h, unsigned long filter_flags, const char* name_space);
  attach_function :grib_keys_iterator_new, [:grib_handle_p, :ulong, :string], :pointer

  # @!method grib_keys_iterator_next
  # Step to the next iterator
  #
  # @param kiter         : valid grib_keys_iterator
  # @return              1 if next iterator exists, 0 if no more elements to iterate on
  #
  # int grib_keys_iterator_next(grib_keys_iterator* kiter);
  attach_function :grib_keys_iterator_next, [:pointer], :int

  # @!method grib_keys_iterator_delete
  # Delete the iterator.
  # @param kiter         : valid grib_keys_iterator
  # @return              0 if OK, integer value on error
  #
  # int grib_keys_iterator_delete(grib_keys_iterator* kiter);
  attach_function :grib_keys_iterator_delete, [:pointer], :int

  # @!method grib_keys_iterator_get_name
  # get the key name from the iterator
  #
  # @param kiter [FFI::Pointer] valid grib_keys_iterator
  #   const grib_keys_iterator* kiter
  # @return [String] key name
  attach_function :grib_keys_iterator_get_name, [:pointer], :string

  # @!method grib_keys_iterator_get_string
  # get the key value from the iterator
  #
  # @param kiter [FFI::Pointer] valid grib_keys_iterator
  #   const grib_keys_iterator* kiter
  # @param v [FFI::Pointer] output parameter the address of a string where the data will be retrieved
  #   char* v
  # @param len [FFI::Pointer] output parameter the address of a size_t where the length of the string will be retrieved
  #   size_t* len
  # @return [Integer, String] status 0 if OK, integer value on error
  def self.grib_keys_iterator_get_string(iterator, length = 1024)
    size = FFI::MemoryPointer.new(:size_t)
    size.write_int(length)
    buf = FFI::MemoryPointer.new(:char, length)
    status = _grib_keys_iterator_get_string(iterator, buf, size)
    assert_return_code(status, 'Error getting string from iterator')

    buf.read_string
  end
  attach_function :_grib_keys_iterator_get_string, :grib_keys_iterator_get_string, [:pointer, :pointer, :pointer], :int

  # @!method grib_nearest_new
  # Create a new nearest neighbour object from a handle, using current geometry.
  #
  # @param handle [FFI::Pointer] the handle from which the nearest object will be created
  # @return [FFI::Pointer] the new nearest, NULL if no nearest can be created
  def self.grib_nearest_new(handle)
    status = FFI::MemoryPointer.new(:int)
    nearest = _grib_nearest_new(handle, status)
    GribApi.assert_return_code(status.read_int, 'Error creating nearest')

    nearest
  end
  attach_function :_grib_nearest_new, :grib_nearest_new, [:grib_handle_p, :pointer], :pointer

  GRIB_NEAREST_SAME_GRID  = 1 << 0
  GRIB_NEAREST_SAME_DATA  = 1 << 1
  GRIB_NEAREST_SAME_POINT = 1 << 2

  # @!method grib_nearest_find
  # Find the 4 nearest points of a latitude longitude point.
  # The flags are provided to speed up the process of searching. If you are
  # sure that the point you are asking for is not changing from a call
  # to another you can use GRIB_NEAREST_SAME_POINT. The same is valid for
  # the grid. Flags can be used together doing a bitwise OR.
  # The distances are given in kilometres.
  #
  # @param handle [FFI::Pointer] handle from which geography and data values are taken
  # @param inlat [Float] latitude of the point to search for
  # @param inlon [Float] longitude of the point to search for
  # @param flags [Integer] GRIB_NEAREST_SAME_POINT, GRIB_NEAREST_SAME_GRID
  def self.grib_nearest_find(handle, lat, lon, flags = GRIB_NEAREST_SAME_POINT)
    neighbour = grib_nearest_new(handle)

    array_length = 4
    size = FFI::MemoryPointer.new(:size_t)
    size.write_int(array_length)
    out_lats = FFI::MemoryPointer.new(:double, array_length)
    out_lons = FFI::MemoryPointer.new(:double, array_length)
    values = FFI::MemoryPointer.new(:double, array_length)
    distances = FFI::MemoryPointer.new(:double, array_length)
    indexes = FFI::MemoryPointer.new(:int, array_length)

    status = _grib_nearest_find(neighbour, handle, lat, lon, flags,
                                out_lats, out_lons, values, distances, indexes, size)
    assert_return_code(status, 'Error finding nearest points')

    SurroundingPoints.new(
      lats: out_lats.read_array_of_double(array_length),
      lons: out_lons.read_array_of_double(array_length),
      values: values.read_array_of_double(array_length),
      distances: distances.read_array_of_double(array_length),
      indexes: indexes.read_array_of_int(array_length)
    )
  ensure
    grib_nearest_delete(neighbour)
  end
  attach_function :_grib_nearest_find,
                  :grib_nearest_find,
                  [:pointer, :grib_handle_p, :double, :double, :ulong,
                   :pointer, :pointer, :pointer, :pointer, :pointer, :pointer],
                  :int

  # @!method grib_nearest_delete
  # Frees a nearest neighbour object from memory
  #
  # @param nearest [FFI::Pointer] the nearest
  #   grib_nearest* nearest
  # @return [Integer] 0 if OK, integer value on error
  def self.grib_nearest_delete(nearest)
    status = _grib_nearest_delete(nearest)
    assert_return_code(status, 'Error deleting nearest')
  end
  attach_function :_grib_nearest_delete, :grib_nearest_delete, [:pointer], :int

  # @!method grib_nearest_find_multiple
  # Find the nearest point of a latitude longitude point.
  #
  # @param handle [FFI::Pointer] handle from which geography and data values are taken
  # @param lat [Float] latitude of the point to search for
  # @param lon [Float] longitude of the point to search for
  # @param is_lsm [Integer] 0 if the point is not a land sea mask, 1 if it is
  # @return [Array<NearestPoint>] the nearest point
  def self.grib_nearest_find_multiple(handle, lats, lons, is_lsm = 0) # rubocop:disable Metrics/AbcSize
    raise ArgumentError, 'lats and lons must have the same length' if lats.length != lons.length

    number_of_points = lats.length

    inlats = FFI::MemoryPointer.new(:double, number_of_points).put_array_of_double(0, lats)
    inlons = FFI::MemoryPointer.new(:double, number_of_points).put_array_of_double(0, lons)
    outlats = FFI::MemoryPointer.new(:double, number_of_points)
    outlons = FFI::MemoryPointer.new(:double, number_of_points)
    values = FFI::MemoryPointer.new(:double, number_of_points)
    distances = FFI::MemoryPointer.new(:double, number_of_points)
    indexes = FFI::MemoryPointer.new(:int, number_of_points)

    status = _grib_nearest_find_multiple(handle, is_lsm, inlats, inlons, number_of_points,
                                         outlats, outlons, values, distances, indexes)
    GribApi.assert_return_code(status, 'Error finding nearest point')

    outlats_values = outlats.read_array_of_double(number_of_points)
    outlons_values = outlons.read_array_of_double(number_of_points)
    value_values = values.read_array_of_double(number_of_points)
    distance_values = distances.read_array_of_double(number_of_points)
    index_values = indexes.read_array_of_int(number_of_points)

    Array.new(number_of_points) do |i|
      NearestPoint.new(
        lat: outlats_values[i],
        lon: outlons_values[i],
        value: value_values[i],
        distance: distance_values[i],
        index: index_values[i]
      )
    end
  end
  attach_function :_grib_nearest_find_multiple,
                  :grib_nearest_find_multiple,
                  [:grib_handle_p, :int, :pointer, :pointer, :long,
                   :pointer, :pointer, :pointer, :pointer, :pointer],
                  :int

  DataResult = Data.define(:lats, :lons, :values)
  SurroundingPoints = Data.define(:lats, :lons, :values, :distances, :indexes)
  NearestPoint = Data.define(:lat, :lon, :value, :distance, :index)

  Level = Data.define(:level, :type) do
    def ==(other)
      type == other.type && level == other.level
    end
  end

  def self.open(file_path) = File.new(file_path)

  class File
    def initialize(file_path)
      @file_path = file_path
      @file_pointer = Stdio.fopen(file_path.to_s, 'r')

      ObjectSpace.define_finalizer(self, self.class.finalize(@file_pointer))
    end

    def timestamp
      messages.first&.timestamp
    end

    def messages
      @messages ||= [].tap do |messages|
        loop do
          handle = GribApi.grib_handle_new_from_file(@file_pointer)
          break if handle.null?

          messages << Message.new(handle)
        end
      end
    end

    def message_count
      GribApi.grib_count_in_file(@file_pointer)
    end

    def self.finalize(file_pointer)
      proc { Stdio.fclose(file_pointer) }
    end
  end

  class Message
    def initialize(handle)
      @handle = handle

      ObjectSpace.define_finalizer(self, self.class.finalize(@handle))
    end

    def self.finalize(handle)
      proc { ::GribApi.grib_handle_delete(handle) }
    end

    def timestamp
      date = read_string_parameter('validityDate')
      time = read_string_parameter('validityTime').rjust(4, '0')
      Time.zone.strptime("#{date}#{time}", '%Y%m%d%H%M')
    end

    def number_of_points = read_int_parameter('numberOfPoints')

    def variable = read_string_parameter('cfName')

    def level
      Level.new(level: read_int_parameter('level'), type: read_string_parameter('typeOfLevel'))
    end

    # @param lat [Float] latitude of the point to search for
    # @param lon [Float] longitude of the point to search for
    # @return [SurroundingPoints]
    def surrounding_points(lat, lon) = GribApi.grib_nearest_find(@handle, lat, lon)

    # @param lat [Float] latitude of the point to search for
    # @param lon [Float] longitude of the point to search for
    # @return [NearestPoint]
    def nearest_point(lat, lon) = GribApi.grib_nearest_find_multiple(@handle, [lat], [lon], 0).first

    # @param namespace [String] the namespace to filter the keys. Possible values are:
    # [ls]
    #   This is the namespace used by the grib_ls and bufr_ls tools and has the most commonly used keys e.g. centre,
    #   shortName, level, etc
    # [parameter]
    #   paramId, shortName, units which relate to the meteorological parameter
    # [statistics]
    #   statistics of the data values e.g. maximum, minimum, average, standard deviation, etc
    # [time]
    #   forecast runs e.g. forecast date, validity date, steps, etc
    # [geography]
    #   grid geometry e.g. bounding box of the grid, number of points along a parallel, etc
    # [vertical]
    #   levels and layers e.g. type of the level, list of coefficients of the vertical coordinate, etc
    # [mars]
    #   ECMWF's Meteorological Archive and Retrieval System keywords like class, stream, type, etc
    # See: https://confluence.ecmwf.int/display/UDOC/What+are+namespaces+-+ecCodes+GRIB+FAQ
    #
    # @return [Array<Array<String, String>>] the keys
    def keys(namespace = nil)
      iterator = GribApi.grib_keys_iterator_new(@handle, 0, namespace)
      keys = []
      while GribApi.grib_keys_iterator_next(iterator) == 1
        begin
          name = GribApi.grib_keys_iterator_get_name(iterator)
          value = GribApi.grib_keys_iterator_get_string(iterator)
          keys << [name, value]
        rescue GribApi::GribError => e
          logger.debug "Error reading key #{name}: #{e.class}: #{e.message}"
        end
      end
      keys
    ensure
      GribApi.grib_keys_iterator_delete(iterator)
    end

    def data = GribApi.grib_get_data(@handle)

    def read_string_parameter(key, length = 1024) = GribApi.grib_get_string(@handle, key, length)

    def read_int_parameter(key) = GribApi.grib_get_long(@handle, key)

    private

    def logger
      @logger ||= Logger.new($stdout)
    end
  end
end
