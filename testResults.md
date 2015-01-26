RUN 1
app.js:346 0.15 "events2--storeArguments-passThroughArguments"
app.js:346 0.13 "events3-checks--"
app.js:346 0.16 "events3---"
app.js:346 0.13 "events4-checks-storeArguments-passThroughArguments"
app.js:346 0.11 "events4-checks-storeArguments-"
app.js:346 0.11 "events4-checks--passThroughArguments"
app.js:346 0.1 "events4-checks--"
app.js:346 0.14 "events4--storeArguments-passThroughArguments"
app.js:346 0.14 "events4--storeArguments-"
app.js:346 0.14 "events4---passThroughArguments"
app.js:346 0.15 "events4---"
app.js:346 0.16 "events2Opt-checks-storeArguments-passThroughArguments"
app.js:346 0.21 "events2Opt--storeArguments-passThroughArguments"
app.js:346 0.16 "events3Opt-checks--"
app.js:346 0.23 "events3Opt---"
app.js:346 0.15 "events4Opt-checks-storeArguments-passThroughArguments"
app.js:346 0.14 "events4Opt-checks-storeArguments-"
app.js:346 0.14 "events4Opt-checks--passThroughArguments"
app.js:346 0.13 "events4Opt-checks--"
app.js:346 0.19 "events4Opt--storeArguments-passThroughArguments"
app.js:346 0.19 "events4Opt--storeArguments-"
app.js:346 0.2 "events4Opt---passThroughArguments"
app.js:346 0.21 "events4Opt---"

RUN2
app.js:346 0.199 "events2Opt--storeArguments-passThroughArguments"
app.js:346 0.196 "events3Opt---"
app.js:346 0.214 "events4Opt--storeArguments-passThroughArguments"
app.js:346 0.19 "events4Opt--storeArguments-"
app.js:346 0.217 "events4Opt---passThroughArguments"
app.js:346 0.205 "events4Opt---"

RUN3
app.js:346 0.215 "events2Opt--storeArguments-passThroughArguments"
app.js:346 0.195 "events3Opt---"
app.js:346 0.217 "events4Opt--storeArguments-passThroughArguments"
app.js:346 0.195 "events4Opt--storeArguments-"
app.js:346 0.215 "events4Opt---passThroughArguments"
app.js:346 0.203 "events4Opt---"

RUN4
app.js:346 0.213 "events2Opt--storeArguments-passThroughArguments"
app.js:346 0.195 "events3Opt---"
app.js:346 0.221 "events4Opt--storeArguments-passThroughArguments"
app.js:346 0.204 "events4Opt--storeArguments-"
app.js:346 0.218 "events4Opt---passThroughArguments"
app.js:346 0.214 "events4Opt---"

RUN5
app.js:346 0.213 "events2Opt--storeArguments-passThroughArguments"
app.js:346 0.206 "events3Opt---"
app.js:346 0.216 "events4Opt--storeArguments-passThroughArguments"
app.js:346 0.199 "events4Opt--storeArguments-"
app.js:346 0.213 "events4Opt---passThroughArguments"
app.js:346 0.208 "events4Opt---"

RUN6
app.js:346 0.21 "events2Opt--storeArguments-passThroughArguments"
app.js:346 0.2 "events3Opt---"
app.js:346 0.21 "events4Opt--storeArguments-passThroughArguments"
app.js:346 0.184 "events4Opt--storeArguments-"
app.js:346 0.221 "events4Opt---passThroughArguments"
app.js:346 0.22 "events4Opt---"

Opt
De geoptimaliseerde versies zijn sowieso veel sneller dus we blijven geoptimaliseerde versies gebruiken

Checks
Checks zijn duidelijk langzamer (30%) dus die optie blijft er in

Events2 (sowieso arguments opslaan / doorpasen) tov Events4 (met beide keuzes enabled)
Events3 (arguments nooit opslaan / doorpasen) tov Events4 (met beide keuzes disabled)
Alles opties zijn om en nabij gelijk aan elkaar, wat betekent dat het niet uitmaakt of je met een config optie dingen aan of uitzet (met bijbehorende extra code), of dat de optie altijd aan of uit staat (met minder bijbehorende code)

Events4 met arguments opties aan of uit
Eigenlijk zijn alle vier de opties nagenoeg gelijk aan elkaar, waardoor je de conclusie kan trekken dat je het net zo goed altijd aan kan hebben

Algemene gedachtes over passing through arguments
Gezien er geen extra logica bij komt en er niks wordt opgeslagen is er eigenlijk geen reden om het niet te doen

Algemene gedachtes over storing van arguments
Store arguments lijkt in Events4 tov van niet storen (en de rest van de opties ook disabled) wel enigszins uit te maken. Dit kan aan twee dingen liggen: Het opslaan van objecten in het het geheugen, of de minder efficiente lookup die gedaan kan worden in een array met object (bij wel opslaan) ipv een array met strings (bij niet opslaan). Wel speelt het geheugen niet echt een rol, gezien, als je geen argumenten zou willen opslaan, je deze ook niet zou moeten meegeven. Daar staat tegenover dat je te maken kan krijgen met zaken waar je geen invloed op hebt, zoals $stateChange die normaliter veel shit meegeeft.

Raar
Het lijkt alsof het activeren van passThroughArguments positief werkt voor de doorvoersnelheid. Maar is niet logisch. Direct een functie aanroepen is ook beter dan apply, zie http://jsperf.com/apply-versus-direct

Toekomstige optimalisaties
Wanneer de indexOf is geoptimaliseerd kan het wellicht zin hebben deze tests opnieuw te runnen en kijken wat de uitkomst is, of het de resultaten toch enigszins uit elkaar trekt. Voorlopig de store keuze er in laten
&
Is het niet beter om toch arrays bij deletion te splicen om arrays klein te houden, geen !== null check te hoeven doen? Dit tov het idee dat een value in een array nullen de array optimaal houdt tov een splice
