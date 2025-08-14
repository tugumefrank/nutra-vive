Domestic Prices (3.4.22)
Download OpenAPI specification:Download

Contact Us: USPS API Support | Terms of Service

The prices API can be used to calculate postage rates for domestic packages:

Base postage based on a set of given package characteristics
Base postage based on a given Stock Keeping Units (SKUs)
Extra service postage based on a given extra service code and mail class
A list of eligible products for a given set of package characteristics
For specifications such as package and letter dimensions, delivery information, etc., please refer to the Domestic Mail Manual (DMM).

For a list of published prices please refer to the USPS® Price List.

To discover the rate ingredients for this API, please visit Publication 205.

Authentication, Authorization and Access Control

Client applications are given authorized access to protected information resources. Authorization is accomplished via the USPS® Customer Onboarding Platform, where Customer Registration users may grant applications access to their protected business information. All client applications must go through this onboarding process. Any Customer Registration user wishing to share their protected business information with client application(s) may also grant authorized access.

The OAuth2, version 3 (/v3), API is based on this authorization grant and must be used to get tokens for all V3 APIs.

The resulting OAuth2 access token is to be placed in the Authorization header, using the Bearer authentication scheme.
All version 3 APIs validate access to protected information resources and will respond with a 401 HTTP status, Unauthorized reason, when the client application has not been authorized to access the given information resource.
The following APIs may include payment account or permit identification used to get contract rates.

If all mail classes are needed, please use the /total-rates/search endpoint.

Resources
Performs a search for base price using the submitted rate ingredients.
Returns an eligible price given a set of package rate ingredients.

Authorizations:
OAuth
Request Body schema:
application/json
application/json
The search parameters to be used for the query.

originZIPCode
required
string^\d{5}(?:[-\s]\d{4})?$
This is the originating ZIP Code™ for the package.

destinationZIPCode
required
string^\d{5}(?:[-\s]\d{4})?$
This is destination ZIP Code™ for the package.

weight
required
number <double> (weightPounds)
This is the calculated weight for the package based on user input. The greater of dimWeight and weight will be used to calculated the rate. Weight unit of measurement is in pounds.

length
required
number <double> (length)
This is the package length in inches. The maximum dimension is always length.

width
required
number <double> (width)
This is the package width in inches. The second longest dimension is always width.

height
required
number <double> (height)
This is the package height in inches.

mailClass
required
string (mailClass)
Enum: "PARCEL_SELECT" "PARCEL_SELECT_LIGHTWEIGHT" "PRIORITY_MAIL_EXPRESS" "PRIORITY_MAIL" "FIRST-CLASS_PACKAGE_SERVICE" "LIBRARY_MAIL" "MEDIA_MAIL" "BOUND_PRINTED_MATTER" "USPS_CONNECT_LOCAL" "USPS_CONNECT_MAIL" "USPS_CONNECT_REGIONAL" "USPS_GROUND_ADVANTAGE" "USPS_GROUND_ADVANTAGE_RETURN_SERVICE" "USPS_RETAIL_GROUND" "GROUND_RETURN_SERVICE" "FIRST-CLASS_PACKAGE_RETURN_SERVICE" "PRIORITY_MAIL_RETURN_SERVICE" "PRIORITY_MAIL_EXPRESS_RETURN_SERVICE"
The mail service requested.

Note:

PARCEL_SELECT_LIGHTWEIGHT is deprecated and will convert to PARCEL_SELECT
FIRST-CLASS_PACKAGE_SERVICE is deprecated and will convert to USPS_GROUND_ADVANTAGE
FIRST-CLASS_PACKAGE_RETURN_SERVICE is deprecated and will convert to USPS_GROUND_ADVANTAGE_RETURN_SERVICE
GROUND_RETURN_SERVICE is deprecated and will convert to USPS_GROUND_ADVANTAGE_RETURN_SERVICE
USPS_RETAIL_GROUND is no longer supported and will return a 400 if used
processingCategory
required
string
Enum: "LETTERS" "FLATS" "MACHINABLE" "IRREGULAR" "NON_MACHINABLE" "NONSTANDARD"
USPS categorizes parcels into one of two mail processing categories: MACHINABLE or NONSTANDARD. These categories are based on the physical dimensions of the piece, regardless of the placement (orientation) of the delivery address on the piece. For more information see Domestic Mail Manual (DMM).

Machinable letter-size mail is:

Not less than 5 inches long, 3-1/2 inches high, and 0.007-inch thick. For pieces more than 4-1/4 inches high or 6 inches long, or both, the minimum thickness is 0.009.(Pieces not meeting the 0.009 thickness are non-machinable letters under 2.1.)
Not more than 11-1/2 inches long, or more than 6-1/8 inches high, or greater than 1/4-inch thick.
Rectangular, with four square corners and parallel opposite sides. Letter-size, card-type mailpieces made of cardstock may have finished corners that do not exceed a radius of 0.125 inch (1/8 inch) unless prepared as Customized Market Mail under 243.9.0. See Exhibit 1.1.1.
Within an aspect ratio (length divided by height) of 1.3 to 2.5, inclusive.
Subject to additional dimensional restrictions in 3.0, depending on mailpiece design.
Flat-size mail must have the following characteristics:

Be more than 11-1/2 inches long, or more than 6-1/8 inches high, or more than 1/4 inch thick, other than automation flats under 6.0 or as allowed for USPS® Marketing Mail pieces with simplified addresses under 5.2.2. Mailpieces other than automation flats or USPS® Marketing Mail pieces with simplified addresses that are 1/4 inch thick or less must be at least 3-1/2 inches high and at least 5 inches long and be at least 0.007 inch thick.
Be not more than 15 inches long or more than 12 inches high or more than 3/4 inch thick, except for:
Periodicals non-machinable flat-size pieces mailed as specified in 207.26.0. They must not be more than 1–1/4 inches thick.
Polywrapped flats, with selvage that extends beyond the contents, up to a maximum length of 15-3/4 inches or a maximum height of 12-1/2 inches. The enclosed contents must not be longer than 15 inches or higher than 12 inches.
Co-mailed polywrapped flats mailed as specified in Customer Support Ruling PS-346, with selvage that extends beyond the contents, up to a maximum height of 12-7/8 inches. The enclosed contents must not be higher than 12 inches.
Be rectangular with four square corners or with finished corners that do not exceed a radius of 0.125 inch (1/8 inch) unless prepared as Customized Market Mail under 9.0.
Be categorized as a catalog.
Other size or weight standards may apply to mail addressed to certain APOs and FPOs, and mail sent by the Department of State to U.S. government personnel abroad.
Note:

IRREGULAR is deprecated and will convert to NONSTANDARD as of 01/19/2025.
NON_MACHINABLE is deprecated and will convert to NONSTANDARD as of 01/19/2025.
rateIndicator
required
string
Enum: "3D" "3N" "3R" "5D" "BA" "BB" "BM" "C1" "C2" "C3" "C4" "C5" "CP" "CM" "DC" "DE" "DF" "DN" "DR" "E4" "E6" "E7" "FA" "FB" "FE" "FP" "FS" "LC" "LF" "LL" "LO" "LS" "NP" "O1" "O2" "O3" "O4" "O5" "O6" "O7" "OS" "P5" "P6" "P7" "P8" "P9" "Q6" "Q7" "Q8" "Q9" "Q0" "PA" "PL" "PM" "PR" "SB" "SN" "SP" "SR"
Rate ingredient to determine pricing categorization for calculating the price

3D - 3-Digit
3N - 3-Digit Dimensional Rectangular
3R - 3-Digit Dimensional Nonrectangular
5D - 5-Digit
BA - Basic
BB - Mixed NDC
BM - NDC
C1 - Cubic Pricing Tier 1
C2 - Cubic Pricing Tier 2
C3 - Cubic Pricing Tier 3
C4 - Cubic Pricing Tier 4
C5 - Cubic Pricing Tier 5
CP - Cubic Parcel
CM - USPS Connect Local® Mail
DC - NDC
DE - SCF
DF - 5-Digit
DN - Dimensional Nonrectangular
DR - Dimensional Rectangular
E4 - Priority Mail Express Flat Rate Envelope - Post Office To Addressee
E6 - Priority Mail Express Legal Flat Rate Envelope
E7 - Priority Mail Express Legal Flat Rate Envelope Sunday / Holiday
FA - Legal Flat Rate Envelope
FB - Medium Flat Rate Box/Large Flat Rate Bag
FE - Flat Rate Envelope
FP - Padded Flat Rate Envelope
FS - Small Flat Rate Box
LC - USPS Connect® Local Single Piece
LF - USPS Connect® Local Flat Rate Box
LL - USPS Connect® Local Large Flat Rate Bag
LO - USPS Connect® Local Oversized
LS - USPS Connect® Local Small Flat Rate Bag
NP - Non-Presorted
O1 - Full Tray Box
O2 - Half Tray Box
O3 - EMM Tray Box
O4 - Flat Tub Tray Box
O5 - Surface Transported Pallet
O6 - Full Pallet Box
O7 - Half Pallet Box
OS - Oversized
P5 - Cubic Soft Pack Tier 1
P6 - Cubic Soft Pack Tier 2
P7 - Cubic Soft Pack Tier 3
P8 - Cubic Soft Pack Tier 4
P9 - Cubic Soft Pack Tier 5
Q6 - Cubic Soft Pack Tier 6
Q7 - Cubic Soft Pack Tier 7
Q8 - Cubic Soft Pack Tier 8
Q9 - Cubic Soft Pack Tier 9
Q0 - Cubic Soft Pack Tier 10
PA - Priority Mail Express Single Piece
PL - Large Flat Rate Box
PM - Large Flat Rate Box APO/FPO/DPO
PR - Presorted
SB - Small Flat Rate Bag
SN - SCF Dimensional Nonrectangular
SP - Single Piece
SR - SCF Dimensional Rectangular
destinationEntryFacilityType
required
string
Enum: "NONE" "DESTINATION_NETWORK_DISTRIBUTION_CENTER" "DESTINATION_SECTIONAL_CENTER_FACILITY" "DESTINATION_DELIVERY_UNIT" "DESTINATION_SERVICE_HUB"
Types of Facilities

NONE - Translate to Destination Rate Indicator N
DESTINATION_NETWORK_DISTRIBUTION_CENTER - Translate to Destination Rate Indicator B
DESTINATION_SECTIONAL_CENTER_FACILITY - Translate to Destination Rate Indicator S
DESTINATION_DELIVERY_UNIT - Translate to Destination Rate Indicator D
DESTINATION_SERVICE_HUB - Translate to Destination Rate Indicator H
priceType
required
string (priceType)
Enum: "RETAIL" "COMMERCIAL" "CONTRACT" "NSA"
Price type can be _ 'RETAIL' _ 'COMMERCIAL' _ 'CONTRACT' _ 'NSA' (deprecated)

mailingDate
string <date> (mailingDate)
The date the package or letter/flat/card will be mailed. The mailing date may be today plus 0 to 7 days in advance.

accountType
string
Enum: "EPS" "PERMIT" "METER" "MID"
The type of payment account linked to a contract rate.

Note:

METER pricing is only available to PC Postage providers.
MID pricing is only available for return mail classes.
accountNumber
string^\d+$
The Enterprise Payment Account, Permit number, PC Postage meter number, or Mailer ID associated with a contract.

hasNonstandardCharacteristics
boolean
Default: false
Package is nonstandard. Nonstandard packages include cylindrical tubes and rolls, certain high-density items, cartons containing more than 24 ounces of liquids in one or more glass containers, cartons containing 1 gallon or more of liquid in metal or plastic containers, and items in 201.7.6.2.

Responses
200 Successful Response
400 Bad Request. There is an error in the received request.
401 Unauthorized request.
403 Access is denied.
404 Resource Not Found
429 Too Many Requests. Too many requests have been received from client in a short amount of time.
503 Service is unavailable
default Other unanticipated errors that may occur.

post
/base-rates/search

Request samples
Payload
Content type

application/json
application/json

Copy
{
"originZIPCode": "22407",
"destinationZIPCode": "63118",
"weight": 5,
"length": 0,
"width": 0,
"height": 0,
"mailClass": "USPS_GROUND_ADVANTAGE",
"processingCategory": "MACHINABLE",
"rateIndicator": "SP",
"destinationEntryFacilityType": "NONE",
"priceType": "COMMERCIAL",
"mailingDate": "2021-07-01",
"accountType": "EPS",
"accountNumber": "1234567890",
"hasNonstandardCharacteristics": false
}
Response samples
200400401403404429503
Content type

application/json
application/json

Copy
Expand allCollapse all
{
"totalBasePrice": 3.35,
"rates": [
{}
]
}
Search for extra services using rate ingredients.
Returns eligible extra service prices, descriptions, and SKUs given a set of package rate ingredients. NOTE: The request using an integer (instead of an array) for extraServices is deprecated and will be removed in June 2025.

Authorizations:
OAuth
Request Body schema:
application/json
application/json
The search parameters to be used for the query.

One of Extra Service Rate QueryExtra Service Rate Query With Integer
extraServices
Array of integers[ items\d{3} ]
Items Enum: 415 480 481 482 483 484 485 486 487 488 489 498 500 501 502 810 811 812 813 814 815 816 817 818 819 820 821 822 823 824 825 826 827 828 829 830 831 832 853 856 857 858 910 911 912 913 915 917 920 921 922 923 924 925 930 931 934 940 941 955 957 972 981 984 986 991
Extra Service Code requested.

415 - USPS Label Delivery Service
480 - Tracking Plus 6 Months
481 - Tracking Plus 1 Year
482 - Tracking Plus 3 Years
483 - Tracking Plus 5 Years
484 - Tracking Plus 7 Years
485 - Tracking Plus 10 Years
486 - Tracking Plus Signature 3 Years
487 - Tracking Plus Signature 5 Years
488 - Tracking Plus Signature 7 Years
489 - Tracking Plus Signature 10 Years
498 - PO Box Locker – Stocking Fee (NSA Only)
500 - PO Box Locker – Self-Service Pickup Fee (NSA Only)
501 - PO Box Locker – Clerk-Assisted Pickup Fee (NSA Only)
502 - PO Box Locker – Local Delivery Fee (NSA Only)
810 - Hazardous Materials - Air Eligible Ethanol
811 - Hazardous Materials - Class 1 – Toy Propellant/Safety Fuse Package
812 - Hazardous Materials - Class 3 - Flammable and Combustible Liquids
813 - Hazardous Materials - Class 7 – Radioactive Materials
814 - Hazardous Materials - Class 8 – Air Eligible Corrosive Materials
815 - Hazardous Materials - Class 8 – Nonspillable Wet Batteries
816 - Hazardous Materials - Class 9 - Lithium Battery Marked Ground Only
817 - Hazardous Materials - Class 9 - Lithium Battery Returns
818 - Hazardous Materials - Class 9 - Marked Lithium Batteries
819 - Hazardous Materials - Class 9 – Dry Ice
820 - Hazardous Materials - Class 9 – Unmarked Lithium Batteries
821 - Hazardous Materials - Class 9 – Magnetized Materials
822 - Hazardous Materials - Division 4.1 – Mailable Flammable Solids and Safety Matches
823 - Hazardous Materials - Division 5.1 – Oxidizers
824 - Hazardous Materials - Division 5.2 – Organic Peroxides
825 - Hazardous Materials - Division 6.1 – Toxic Materials
826 - Hazardous Materials - Division 6.2 Biological Materials
827 - Hazardous Materials - Excepted Quantity Provision
828 - Hazardous Materials - Ground Only Hazardous Materials
829 - Hazardous Materials - Air Eligible ID8000 Consumer Commodity
830 - Hazardous Materials - Lighters
831 - Hazardous Materials - Limited Quantity Ground
832 - Hazardous Materials - Small Quantity Provision (Markings Required)
853 - Special Handling - Perishable Material
856 - Live Animal Transportation Fee
857 - Hazardous Materials
858 - Cremated Remains
910 - Certified Mail
911 - Certified Mail Restricted Delivery
912 - Certified Mail Adult Signature Required
913 - Certified Mail Adult Signature Restricted Delivery
915 - Collect on Delivery
917 - Collect on Delivery Restricted Delivery
920 - USPS Tracking Electronic
921 - Signature Confirmation
922 - Adult Signature Required
923 - Adult Signature Restricted Delivery
924 - Signature Confirmation Restricted Delivery
925 - Priority Mail Express Merchandise Insurance
930 - Insurance <= $500
931 - Insurance > $500
934 - Insurance Restricted Delivery
940 - Registered Mail
941 - Registered Mail Restricted Delivery
955 - Return Receipt
957 - Return Receipt Electronic
972 - Live Animal and Perishable Handling Fee
981 - Signature Requested (PRIORITY_MAIL_EXPRESS only)
984 - Parcel Locker Delivery
986 - PO to Addressee (PRIORITY_MAIL_EXPRESS only)
991 - Sunday Delivery
Note: Entering a single extra service will be removed in the next major revision.

mailClass
required
string (mailClass)
Enum: "PARCEL_SELECT" "PARCEL_SELECT_LIGHTWEIGHT" "PRIORITY_MAIL_EXPRESS" "PRIORITY_MAIL" "FIRST-CLASS_PACKAGE_SERVICE" "LIBRARY_MAIL" "MEDIA_MAIL" "BOUND_PRINTED_MATTER" "USPS_CONNECT_LOCAL" "USPS_CONNECT_MAIL" "USPS_CONNECT_REGIONAL" "USPS_GROUND_ADVANTAGE" "USPS_GROUND_ADVANTAGE_RETURN_SERVICE" "USPS_RETAIL_GROUND" "GROUND_RETURN_SERVICE" "FIRST-CLASS_PACKAGE_RETURN_SERVICE" "PRIORITY_MAIL_RETURN_SERVICE" "PRIORITY_MAIL_EXPRESS_RETURN_SERVICE"
The mail service requested.

Note:

PARCEL_SELECT_LIGHTWEIGHT is deprecated and will convert to PARCEL_SELECT
FIRST-CLASS_PACKAGE_SERVICE is deprecated and will convert to USPS_GROUND_ADVANTAGE
FIRST-CLASS_PACKAGE_RETURN_SERVICE is deprecated and will convert to USPS_GROUND_ADVANTAGE_RETURN_SERVICE
GROUND_RETURN_SERVICE is deprecated and will convert to USPS_GROUND_ADVANTAGE_RETURN_SERVICE
USPS_RETAIL_GROUND is no longer supported and will return a 400 if used
priceType
required
string (priceType)
Enum: "RETAIL" "COMMERCIAL" "CONTRACT" "NSA"
Price type can be _ 'RETAIL' _ 'COMMERCIAL' _ 'CONTRACT' _ 'NSA' (deprecated)

itemValue
number <double> >= 0
The value of the item. Required for Insurance, Registered Mail, and Collect on Delivery.

weight
number <double> (weightPounds)
This is the calculated weight for the package based on user input. The greater of dimWeight and weight will be used to calculated the rate. Weight unit of measurement is in pounds.

originZIPCode
string^\d{5}(?:[-\s]\d{4})?$
The originating ZIP code for the package.

destinationZIPCode
string^\d{5}(?:[-\s]\d{4})?$
The destination ZIP code for the package.

mailingDate
string <date> (mailingDate)
The date the package or letter/flat/card will be mailed. The mailing date may be today plus 0 to 7 days in advance.

accountType
string
Enum: "EPS" "PERMIT" "METER" "MID"
The type of payment account linked to a contract rate.

Note:

METER pricing is only available to PC Postage providers.
MID pricing is only available for return mail classes.
accountNumber
string^\d+$
The Enterprise Payment Account, Permit number, PC Postage meter number, or Mailer ID associated with a contract.

Responses
200 Successful Response
400 Bad Request. There is an error in the received request.
401 Unauthorized request.
403 Access is denied.
404 Resource Not Found
429 Too Many Requests. Too many requests have been received from client in a short amount of time.
503 Service is unavailable
default Other unanticipated errors that may occur.

post
/extra-service-rates/search

Request samples
Payload
Content type

application/json
application/json
Example

Extra Service Rate Query
Extra Service Rate Query

Copy
Expand allCollapse all
{
"extraServices": [
415
],
"mailClass": "USPS_GROUND_ADVANTAGE",
"priceType": "COMMERCIAL",
"itemValue": 0,
"weight": 5,
"originZIPCode": "string",
"destinationZIPCode": "string",
"mailingDate": "2021-07-01",
"accountType": "EPS",
"accountNumber": "123457890"
}
Response samples
200400401403404429503
Content type

application/json
application/json

Copy
Expand allCollapse all
[
{
"extraService": "922",
"name": "Adult Signature Required",
"SKU": "DPXX0XXXXX07200",
"priceType": "RETAIL",
"price": 3.35,
"warnings": []
}
]
Search for eligible products using rate ingredients.
Returns a list of eligible prices given dimensions/weight/destination of pieces.

Search for contract prices; either by:

Enterprise Payment System (EPS) account
Meter number
Permit number
A specific mail class is required when searching for contract prices.

Authorizations:
OAuth
Request Body schema:
application/json
application/json
The search parameters to be used for the query.

originZIPCode
required
string (originZIPCode) ^\d{5}(?:[-\s]\d{4})?$
The originating ZIP code for the package.

destinationZIPCode
required
string (destinationZIPCode) ^\d{5}(?:[-\s]\d{4})?$
The destination ZIP code for the package.

weight
required
number <double> (weightPounds)
This is the calculated weight for the package based on user input. The greater of dimWeight and weight will be used to calculated the rate. Weight unit of measurement is in pounds.

length
required
number <double> (length)
This is the package length in inches. The maximum dimension is always length.

width
required
number <double> (width)
This is the package width in inches. The second longest dimension is always width.

height
required
number <double> (height)
This is the package height in inches.

mailClass
string (mailClassOutboundOnly)
Deprecated
Enum: "PARCEL_SELECT" "PARCEL_SELECT_LIGHTWEIGHT" "PRIORITY_MAIL_EXPRESS" "PRIORITY_MAIL" "FIRST-CLASS_PACKAGE_SERVICE" "LIBRARY_MAIL" "MEDIA_MAIL" "BOUND_PRINTED_MATTER" "USPS_CONNECT_LOCAL" "USPS_CONNECT_MAIL" "USPS_CONNECT_REGIONAL" "USPS_GROUND_ADVANTAGE" "USPS_RETAIL_GROUND" "ALL"
The mail service requested.

Note:

A single mail class option is deprecated and will be removed in the next major revision. This attribute will be replaced with the array of mail classes.
PARCEL_SELECT_LIGHTWEIGHT is deprecated and will convert to PARCEL_SELECT
FIRST-CLASS_PACKAGE_SERVICE is deprecated and will convert to USPS_GROUND_ADVANTAGE
USPS_RETAIL_GROUND is no longer supported and will return a 400 if used
mailClasses
Array of strings (mailClassesOutboundOnly)
Items Enum: "PARCEL_SELECT" "PARCEL_SELECT_LIGHTWEIGHT" "PRIORITY_MAIL_EXPRESS" "PRIORITY_MAIL" "FIRST-CLASS_PACKAGE_SERVICE" "LIBRARY_MAIL" "MEDIA_MAIL" "BOUND_PRINTED_MATTER" "USPS_CONNECT_LOCAL" "USPS_CONNECT_MAIL" "USPS_CONNECT_REGIONAL" "USPS_GROUND_ADVANTAGE" "USPS_RETAIL_GROUND" "ALL"
An Array of mail classes

Note:

PARCEL_SELECT_LIGHTWEIGHT is deprecated and will convert to PARCEL_SELECT
FIRST-CLASS_PACKAGE_SERVICE is deprecated and will convert to USPS_GROUND_ADVANTAGE
USPS_RETAIL_GROUND is no longer supported and will return a 400 if used
priceType
string (priceType)
Enum: "RETAIL" "COMMERCIAL" "CONTRACT" "NSA"
Price type can be _ 'RETAIL' _ 'COMMERCIAL' _ 'CONTRACT' _ 'NSA' (deprecated)

mailingDate
string <date> (mailingDate)
The date the package or letter/flat/card will be mailed. The mailing date may be today plus 0 to 7 days in advance.

accountType
string
Enum: "EPS" "PERMIT" "METER"
The type of payment account linked to a contract rate.

accountNumber
string^\d+$
The Enterprise Payment Account, Permit number or PC Postage meter number associated with a contract.

hasNonstandardCharacteristics
boolean
Default: false
Package is nonstandard. Nonstandard packages include cylindrical tubes and rolls, certain high-density items, cartons containing more than 24 ounces of liquids in one or more glass containers, cartons containing 1 gallon or more of liquid in metal or plastic containers, and items in 201.7.6.2.

Responses
200 Successful Response
400 Bad Request. There is an error in the received request.
401 Unauthorized request.
403 Access is denied.
404 Resource Not Found
429 Too Many Requests. Too many requests have been received from client in a short amount of time.
503 Service is unavailable
default Other unanticipated errors that may occur.

post
/base-rates-list/search

Request samples
Payload
Content type

application/json
application/json

Copy
Expand allCollapse all
{
"originZIPCode": "22407",
"destinationZIPCode": "63118",
"weight": 5,
"length": 0,
"width": 0,
"height": 0,
"mailClass": "PARCEL_SELECT",
"mailClasses": [
"USPS_GROUND_ADVANTAGE",
"PARCEL_SELECT"
],
"priceType": "COMMERCIAL",
"mailingDate": "2021-07-01",
"accountType": "EPS",
"accountNumber": "1234567890",
"hasNonstandardCharacteristics": false
}
Response samples
200400401403404429503
Content type

application/json
application/json

Copy
Expand allCollapse all
{
"rateOptions": [
{}
]
}
Returns a list of eligible prices including extra service fees given a set of package rate ingredients.
This API returns a list of eligible prices, including extra service fees, given the dimensions, weight, origin and destination of your package.

Authorizations:
OAuth
Request Body schema:
application/json
application/json
The search parameters to be used for the query.

originZIPCode
required
string (originZIPCode) ^\d{5}(?:[-\s]\d{4})?$
The originating ZIP code for the package.

destinationZIPCode
required
string (destinationZIPCode) ^\d{5}(?:[-\s]\d{4})?$
The destination ZIP code for the package.

weight
required
number <double> (weightPounds)
This is the calculated weight for the package based on user input. The greater of dimWeight and weight will be used to calculated the rate. Weight unit of measurement is in pounds.

length
required
number <double> (length)
This is the package length in inches. The maximum dimension is always length.

width
required
number <double> (width)
This is the package width in inches. The second longest dimension is always width.

height
required
number <double> (height)
This is the package height in inches.

mailClass
string (mailClassOutboundOnly)
Deprecated
Enum: "PARCEL_SELECT" "PARCEL_SELECT_LIGHTWEIGHT" "PRIORITY_MAIL_EXPRESS" "PRIORITY_MAIL" "FIRST-CLASS_PACKAGE_SERVICE" "LIBRARY_MAIL" "MEDIA_MAIL" "BOUND_PRINTED_MATTER" "USPS_CONNECT_LOCAL" "USPS_CONNECT_MAIL" "USPS_CONNECT_REGIONAL" "USPS_GROUND_ADVANTAGE" "USPS_RETAIL_GROUND" "ALL"
The mail service requested.

Note:

A single mail class option is deprecated and will be removed in the next major revision. This attribute will be replaced with the array of mail classes.
PARCEL_SELECT_LIGHTWEIGHT is deprecated and will convert to PARCEL_SELECT
FIRST-CLASS_PACKAGE_SERVICE is deprecated and will convert to USPS_GROUND_ADVANTAGE
USPS_RETAIL_GROUND is no longer supported and will return a 400 if used
mailClasses
Array of strings (mailClassesOutboundOnly)
Items Enum: "PARCEL_SELECT" "PARCEL_SELECT_LIGHTWEIGHT" "PRIORITY_MAIL_EXPRESS" "PRIORITY_MAIL" "FIRST-CLASS_PACKAGE_SERVICE" "LIBRARY_MAIL" "MEDIA_MAIL" "BOUND_PRINTED_MATTER" "USPS_CONNECT_LOCAL" "USPS_CONNECT_MAIL" "USPS_CONNECT_REGIONAL" "USPS_GROUND_ADVANTAGE" "USPS_RETAIL_GROUND" "ALL"
An Array of mail classes

Note:

PARCEL_SELECT_LIGHTWEIGHT is deprecated and will convert to PARCEL_SELECT
FIRST-CLASS_PACKAGE_SERVICE is deprecated and will convert to USPS_GROUND_ADVANTAGE
USPS_RETAIL_GROUND is no longer supported and will return a 400 if used
priceType
string (priceType)
Enum: "RETAIL" "COMMERCIAL" "CONTRACT" "NSA"
Price type can be _ 'RETAIL' _ 'COMMERCIAL' _ 'CONTRACT' _ 'NSA' (deprecated)

mailingDate
string <date> (mailingDate)
The date the package or letter/flat/card will be mailed. The mailing date may be today plus 0 to 7 days in advance.

accountType
string
Enum: "EPS" "PERMIT" "METER"
The type of payment account linked to a contract rate.

accountNumber
string^\d+$
The Enterprise Payment Account, Permit number or PC Postage meter number associated with a contract.

hasNonstandardCharacteristics
boolean
Default: false
Package is nonstandard. Nonstandard packages include cylindrical tubes and rolls, certain high-density items, cartons containing more than 24 ounces of liquids in one or more glass containers, cartons containing 1 gallon or more of liquid in metal or plastic containers, and items in 201.7.6.2.

itemValue
number <double> >= 0
The value of the item. Required for Insurance, Registered Mail, and Collect on Delivery.

extraServices
Array of integers (ExtraServices) [ items\d{3} ]
Items Enum: 415 480 481 482 483 484 485 486 487 488 489 498 500 501 502 810 811 812 813 814 815 816 817 818 819 820 821 822 823 824 825 826 827 828 829 830 831 832 853 856 857 858 910 911 912 913 915 917 920 921 922 923 924 925 930 931 934 940 941 955 957 972 981 984 986 991
Extra Service Codes requested. If omitted, all available extra services will be returned. To narrow the results, provide a specific set of extra service codes. For convenience, use 986 for PRIORITY_MAIL_EXPRESS or 920 for all other mailClasses.

415 - USPS Label Delivery Service
480 - Tracking Plus 6 Months
481 - Tracking Plus 1 Year
482 - Tracking Plus 3 Years
483 - Tracking Plus 5 Years
484 - Tracking Plus 7 Years
485 - Tracking Plus 10 Years
486 - Tracking Plus Signature 3 Years
487 - Tracking Plus Signature 5 Years
488 - Tracking Plus Signature 7 Years
489 - Tracking Plus Signature 10 Years
498 - PO Box Locker – Stocking Fee (NSA Only)
500 - PO Box Locker – Self-Service Pickup Fee (NSA Only)
501 - PO Box Locker – Clerk-Assisted Pickup Fee (NSA Only)
502 - PO Box Locker – Local Delivery Fee (NSA Only)
810 - Hazardous Materials - Air Eligible Ethanol
811 - Hazardous Materials - Class 1 – Toy Propellant/Safety Fuse Package
812 - Hazardous Materials - Class 3 - Flammable and Combustible Liquids
813 - Hazardous Materials - Class 7 – Radioactive Materials
814 - Hazardous Materials - Class 8 – Air Eligible Corrosive Materials
815 - Hazardous Materials - Class 8 – Nonspillable Wet Batteries
816 - Hazardous Materials - Class 9 - Lithium Battery Marked Ground Only
817 - Hazardous Materials - Class 9 - Lithium Battery Returns
818 - Hazardous Materials - Class 9 - Marked Lithium Batteries
819 - Hazardous Materials - Class 9 – Dry Ice
820 - Hazardous Materials - Class 9 – Unmarked Lithium Batteries
821 - Hazardous Materials - Class 9 – Magnetized Materials
822 - Hazardous Materials - Division 4.1 – Mailable Flammable Solids and Safety Matches
823 - Hazardous Materials - Division 5.1 – Oxidizers
824 - Hazardous Materials - Division 5.2 – Organic Peroxides
825 - Hazardous Materials - Division 6.1 – Toxic Materials
826 - Hazardous Materials - Division 6.2 Biological Materials
827 - Hazardous Materials - Excepted Quantity Provision
828 - Hazardous Materials - Ground Only Hazardous Materials
829 - Hazardous Materials - Air Eligible ID8000 Consumer Commodity
830 - Hazardous Materials - Lighters
831 - Hazardous Materials - Limited Quantity Ground
832 - Hazardous Materials - Small Quantity Provision (Markings Required)
853 - Special Handling - Perishable Material
856 - Live Animal Transportation Fee
857 - Hazardous Materials
858 - Cremated Remains
910 - Certified Mail
911 - Certified Mail Restricted Delivery
912 - Certified Mail Adult Signature Required
913 - Certified Mail Adult Signature Restricted Delivery
915 - Collect on Delivery
917 - Collect on Delivery Restricted Delivery
920 - USPS Tracking Electronic
921 - Signature Confirmation
922 - Adult Signature Required
923 - Adult Signature Restricted Delivery
924 - Signature Confirmation Restricted Delivery
925 - Priority Mail Express Merchandise Insurance
930 - Insurance <= $500
931 - Insurance > $500
934 - Insurance Restricted Delivery
940 - Registered Mail
941 - Registered Mail Restricted Delivery
955 - Return Receipt
957 - Return Receipt Electronic
972 - Live Animal and Perishable Handling Fee
981 - Signature Requested (PRIORITY_MAIL_EXPRESS only)
984 - Parcel Locker Delivery
986 - PO to Addressee (PRIORITY_MAIL_EXPRESS only)
991 - Sunday Delivery
Responses
200 Successful Response
400 Bad Request. There is an error in the received request.
401 Unauthorized request.
403 Access is denied.
404 Resource Not Found
429 Too Many Requests. Too many requests have been received from client in a short amount of time.
503 Service is unavailable
default Other unanticipated errors that may occur.

post
/total-rates/search

Request samples
Payload
Content type

application/json
application/json

Copy
Expand allCollapse all
{
"originZIPCode": "22407",
"destinationZIPCode": "63118",
"weight": 5,
"length": 0,
"width": 0,
"height": 0,
"mailClass": "PARCEL_SELECT",
"mailClasses": [
"USPS_GROUND_ADVANTAGE",
"PARCEL_SELECT"
],
"priceType": "COMMERCIAL",
"mailingDate": "2021-07-01",
"accountType": "EPS",
"accountNumber": "1234567890",
"hasNonstandardCharacteristics": false,
"itemValue": 0,
"extraServices": [
415
]
}
Response samples
200400401403404429503
Content type

application/json
application/json

Copy
Expand allCollapse all
{
"rateOptions": [
{}
]
}
Performs a search for letter prices using the submitted rate ingredients.
Returns an eligible price given a set of package rate ingredients.

Authorizations:
OAuth
Request Body schema:
application/json
application/json
The search parameters to be used for the query.

weight
required
number <double> (weightOunces)
This is the calculated weight for the package based on user input. The greater of dimWeight and weight will be used to calculated the rate. Weight unit of measurement is in ounces.

length
required
number <double> > 0
The letter/flat/card length measured in inches. For LETTERS and CARDS the length is the dimension parallel to the delivery address as read. For FLATS the length is the longest dimension.

height
required
number <double> > 0
The letter/flat/card height measured in inches. The height is the dimension perpendicular to the length.

thickness
required
number <double> > 0
The letter/flat/card thickness measured in inches. The minimum dimension is always the thickness.

processingCategory
required
string
Enum: "LETTERS" "FLATS" "CARDS"
LETTERS
To be eligible for mailing at the price for letters, a piece must be:

Rectangular
At least 3-1/2 inches high x 5 inches long x 0.007 inch thick.
No more than 6-1/8 inches high x 11-1/2 inches long x 1/4 inch thick.
For additional information on letters, please refer to the Postal Explorer.

FLATS
The Postal Service uses the word "flats" to refer to large envelopes, newsletters, and magazines. The words large envelopes and flats are used interchangeably. Whatever you call them, flats must:

Have one dimension that is greater than 6-1/8 inches high OR 11-½ inches long OR ¼ inch thick.
Be no more than 12 inches high x 15 inches long x ¾ inch thick.
For additional information on flats, please refer to the Postal Explorer.

CARDS
To be eligible for mailing at the price for postcards, a piece must be:

Rectangular
At least 3-1/2 inches high x 5 inches long x 0.007 inch thick.
No more than 4-1/4 inches high x 6 inches long x 0.016 inch thick.
For additional information on postcards, please refer to the Postal Explorer.

mailingDate
string <date> (mailingDate)
The date the package or letter/flat/card will be mailed. The mailing date may be today plus 0 to 7 days in advance.

nonMachinableIndicators
object
Set of boolean indicators used to determine whether a letter/flat/card qualifies as nonmachinable.

extraServices
Array of integers
Items Enum: 910 911 930 931 934 940 941 955 957 985
Extra Service Code requested.

910 - Certified Mail
911 - Certified Mail Restricted Delivery
930 - Insurance <=$500
931 - Insurance > $500
934 - Insurance Restricted Delivery
940 - Registered Mail
941 - Registered Mail Restricted Delivery
955 - Return Receipt
957 - Return Receipt Electronic
985 - Hold for Pickup
itemValue
number <double> >= 0
The value of the item. Required for Insurance and Registered Mail.

Responses
200 Successful Response
400 Bad Request. There is an error in the received request.
401 Unauthorized request.
403 Access is denied.
404 Resource Not Found
429 Too Many Requests. Too many requests have been received from client in a short amount of time.
503 Service is unavailable
default Other unanticipated errors that may occur.

post
/letter-rates/search

Request samples
Payload
Content type

application/json
application/json

Copy
Expand allCollapse all
{
"weight": 5,
"length": 0,
"height": 0,
"thickness": 0,
"processingCategory": "LETTERS",
"mailingDate": "2021-07-01",
"nonMachinableIndicators": {
"isPolybagged": false,
"hasClosureDevices": false,
"hasLooseItems": false,
"isRigid": false,
"isSelfMailer": false,
"isBooklet": false
},
"extraServices": [
910
],
"itemValue": 0
}
Response samples
200400401403404429503
Content type

application/json
application/json

Copy
Expand allCollapse all
{
"totalBasePrice": 0.63,
"rates": [
{}
]
}
