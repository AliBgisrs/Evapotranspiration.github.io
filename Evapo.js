Map.centerObject(table);
Map.addLayer(table);

var veg_trans = ee.ImageCollection('CAS/IGSNRR/PML/V2')
.filterDate('2015-01-01','2020-01-01')
.filterBounds(table)
.map(function(img){
  var band = img.select('Ec');
  var clip = band.clip(table);
  return clip;
})
.median();

print(veg_trans);

Map.addLayer(veg_trans,{min:0, max:0.9, palette: ['white','yellow','green','orange','red']});


Export.image.toDrive({
  image: veg_trans,
  description: 'transpiration',
  scale: 500,
  crs: 'EPSG:4326',
  maxPixels:1e13,
  region: table});
  
// dataset time series

var veg_trans = ee.ImageCollection('CAS/IGSNRR/PML/V2')
.filterDate('2002-01-01','2020-01-01')
.filter(ee.Filter.calendarRange(6,6,'month'))
.filterBounds(table)
.map(function(img){
  var id = img.id();
  var band = img.select('Ec');
  var clip = band.clip(table);
  return clip.rename(id);
})
.toBands();

print(veg_trans);

Export.image.toDrive({
  image: veg_trans,
  description: 'transpiration_dataset',
  scale: 2000,
  crs: 'EPSG:4326',
  maxPixels:1e13,
  region: table});
  
  /// transpiration trend
  
  var veg_trans = ee.ImageCollection('CAS/IGSNRR/PML/V2')
.filterDate('2002-01-01','2020-01-01')
.filterBounds(table)
.map(function(img){
  var id = img.id();
  var band = img.select('Ec');
  var clip = band.clip(table);
  return clip
  .copyProperties(img,['system:time_start','system:time_end']);
});

print(ui.Chart.image.series(veg_trans, table,ee.Reducer.median(), 500, 
'system:time_start').setOptions({
  title: 'vegetation transpiration',
  vAxis: {title: 'transpiration mm d-1'},
  hAxis: {title: 'time'},
  trendlines: {0 : {color : 'red'}},
  series: {
    0 : {color: 'black'}
  }
}));


var regions = ee.FeatureCollection([
  ee.Feature(ee.Geometry(geometry),{label: 'point1'}),
  ee.Feature(ee.Geometry(geometry2),{label: 'point2'})
  ]);
  


print(ui.Chart.image.seriesByRegion(veg_trans, regions, 
ee.Reducer.mean(), 'Ec', 500, 'system:time_start', 'label'));


//// monthly product

var monthly_map = function(collection, start, count, interval, units){
  
  var sequence = ee.List.sequence(0,ee.Number(count).subtract(1));
  var original_date = ee.Date(start);
  
  return ee.ImageCollection(sequence.map(function(i){
    
    var start_date = original_date.advance(ee.Number(interval).multiply(i),units);
    var end_date = original_date.advance(ee.Number(interval).multiply(ee.Number(i).add(1)),units);
    
    return collection.filterDate(start_date,end_date).median()
    .set('system:time_start',start_date.millis())
    .set('system:time_end',end_date.millis())
    }))}
    
 var soil_eva = ee.ImageCollection('CAS/IGSNRR/PML/V2')
.filterDate('2002-01-01','2020-01-01')
.filterBounds(table)
.map(function(img){
  var id = img.id();
  var band = img.select('Es');
  var clip = band.clip(table);
  return clip
  .copyProperties(img,['system:time_start','system:time_end']);
});
    
    
var monthly_pro = monthly_map(soil_eva,'2003-01-01',168, 30, 'days');

print(monthly_pro);

print(ui.Chart.image.series(
 monthly_pro, table, ee.Reducer.median(), 500, 'system:time_start'));
 
 
/// IDAHO

var aet = ee.ImageCollection('IDAHO_EPSCOR/TERRACLIMATE')
.filterDate('2002-01-01','2020-01-01')
.filterBounds(table)
.map(function(img){
  var band = img.select('aet');
  var scale = band.multiply(0.1)
  var clip = scale.clip(table);
  return clip
  .copyProperties(img,['system:time_start','system:time_end']);
});

print(ui.Chart.image.series(
 aet, table, ee.Reducer.median(), 4000, 'system:time_start'));
 


  
  
  