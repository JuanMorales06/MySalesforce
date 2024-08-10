/**
 * @description       : Controller of the LWC contactList
 * @author            : Juan Morales
 * @group             : Salesforce Developer
 * @last modified on  : 08-10-2024
 * @last modified by  : Juan Morales
**/
public class ContactController {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getContacts(Integer pageNumber, Integer pageSize, String sortBy, String sortDirection) {

        sortBy = validateSortField(sortBy);
        sortDirection = validateSortDirection(sortDirection);

        Integer offset = (pageNumber - 1) * pageSize;

        String query = 'SELECT Name, Email, Phone, MobilePhone FROM Contact ORDER BY ' +
                       sortBy + ' ' + sortDirection +
                       ' LIMIT ' + pageSize +
                       ' OFFSET ' + offset;

        // error query
        // String query = 'SELECT Name, Email, Phone, MobilePhone FROM Contact WHERE Name = : Juan';

        Map<String, Object> result = new Map<String, Object>();
        List<Contact> contacts = Database.query(query);
        result.put('records', contacts);
        result.put('total', [SELECT count() FROM Contact]);
        return result;
    }

    private static String validateSortField(String fieldName) {
        Set<String> validFields = new Set<String>{'Name', 'Email', 'Phone', 'MobilePhone'};
        return validFields.contains(fieldName) ? fieldName : 'Name';
    }

    private static String validateSortDirection(String direction) {
        return (direction.equalsIgnoreCase('ASC') || direction.equalsIgnoreCase('DESC')) ? direction : 'ASC';
    }
}




