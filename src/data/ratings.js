/**
 * Ratings seed provider (mock-disabled).
 *
 * Parts of the app import a default export from this module.
 * When you don't want mock data yet, keep the export but return empty data.
 */

const ratings = [];

export default ratings;

// let counter = 1;
// const rev = (workerId, jobId, clientName, stars, comment, submittedAt, categories, flags) => ({
//   id: `rat-${String(counter++).padStart(4, '0')}`,
//   workerId,
//   jobId,
//   clientName,
//   stars,
//   comment,
//   categories: categories || { punctuality: stars, quality: stars, communication: stars },
//   flags: flags || null,
//   submittedAt,
// });

// const ratings = [
//   /* --- wrk-201 Rafael Santos (Plumbing, 4.8 / 47 jobs) ------------------- */
//   rev('wrk-201', null, 'Del Pilar Residence', 5, 'Fixed our pipe leak in one visit. Super reliable.', '2026-03-08T14:30:00.000Z'),
//   rev('wrk-201', null, 'Galicia Household', 5, 'Clean work, arrived on the dot.', '2026-02-22T16:10:00.000Z'),
//   rev('wrk-201', null, 'Sunrise Condo HOA', 4, 'Great job. Would hire again for bigger scope.', '2026-01-30T10:45:00.000Z', { punctuality: 5, quality: 4, communication: 4 }),
//   rev('wrk-201', null, 'Torres Family', 5, 'Accommodating and careful with our finished flooring.', '2025-12-18T13:00:00.000Z'),

//   /* --- wrk-202 Jessa Villanueva (Electrical/HVAC, 4.6 / 31 jobs) -------- */
//   rev('wrk-202', null, 'Ayala Rental Unit 4B', 5, 'Professional and thorough rewiring.', '2026-02-14T09:20:00.000Z'),
//   rev('wrk-202', null, 'Serrano Residence', 4, 'Did the job well. Left a small mess we had to sweep.', '2026-01-27T15:00:00.000Z', { punctuality: 5, quality: 5, communication: 3 }),
//   rev('wrk-202', null, 'BlueCove Pharmacy', 5, 'Quick AC service. Explained the issue clearly.', '2025-12-04T11:10:00.000Z'),

//   /* --- wrk-203 Mark Dela Cruz (Welding, 4.5 / 22 jobs) ------------------ */
//   rev('wrk-203', null, 'Manalo Workshop', 5, 'Strong welds. On time.', '2026-02-28T17:00:00.000Z'),
//   rev('wrk-203', null, 'Lagunzad Residence', 4, 'Decent craftsmanship. Communication could be better.', '2026-01-15T14:20:00.000Z', { punctuality: 4, quality: 5, communication: 3 }),
//   rev('wrk-203', null, 'Roxas Gate & Frame', 4, 'Gate fabrication was solid.', '2025-12-19T10:00:00.000Z'),

//   /* --- wrk-204 Alyssa Reyes (Painting, 4.3 / 12 jobs, unverified Tier 1) */
//   rev('wrk-204', null, 'Villareal Home', 4, 'Neat painter. Still new but promising.', '2026-03-03T15:00:00.000Z', { punctuality: 4, quality: 4, communication: 4 }),
//   rev('wrk-204', null, 'Quizon Studio', 4, 'Good finish. Took a bit longer than planned.', '2026-02-05T11:30:00.000Z', { punctuality: 3, quality: 5, communication: 4 }),

//   /* --- wrk-205 Noel Garcia (Masonry, 4.9 / 63 jobs) -------------------- */
//   rev('wrk-205', 'job-105', 'UrbanRise Projects', 5, 'Master-level tile work. Unit ready for turnover ahead of schedule.', '2026-03-01T09:00:00.000Z'),
//   rev('wrk-205', null, 'De Leon Condominium', 5, 'Outstanding. Would book again without hesitation.', '2026-02-08T14:00:00.000Z'),
//   rev('wrk-205', null, 'Santos Compound', 5, 'Very meticulous. Clean finish.', '2026-01-12T10:30:00.000Z'),
//   rev('wrk-205', null, 'Mercado Residence', 5, 'Best mason we have worked with.', '2025-11-28T16:40:00.000Z'),

//   /* --- wrk-206 Kevin Mendoza (HVAC, 4.7 / 38 jobs) --------------------- */
//   rev('wrk-206', null, 'SunBreeze Residences', 5, 'AC working like new. Honest recommendations.', '2026-03-16T13:00:00.000Z'),
//   rev('wrk-206', null, 'Malabanan Household', 4, 'Good work. Had to reschedule once.', '2026-02-20T15:45:00.000Z', { punctuality: 3, quality: 5, communication: 5 }),
//   rev('wrk-206', null, 'CoolLink Mini-Mart', 5, 'Fast turnaround on our freezer install.', '2026-01-05T12:00:00.000Z'),

//   /* --- wrk-207 Judy Salcedo (Roofing, 4.1 / 8 jobs, unverified Tier 1) - */
//   rev('wrk-207', null, 'Cabrera Home', 4, 'Repaired the roof. Small spots needed a second visit.', '2026-01-22T10:00:00.000Z', { punctuality: 4, quality: 4, communication: 4 }),
//   rev('wrk-207', null, 'Valdez Compound', 4, 'Polite and willing. Still gaining experience.', '2025-12-30T14:30:00.000Z', { punctuality: 4, quality: 4, communication: 5 }),

//   /* --- wrk-208 Benjie Torres (Solar, 4.4 / 19 jobs) -------------------- */
//   rev('wrk-208', null, 'Olongapo Eco Homes', 5, 'Neat wiring. Panels producing as expected.', '2026-02-11T09:30:00.000Z'),
//   rev('wrk-208', null, 'Ferrer Residence', 4, 'Good install. Minor delay on inverter delivery.', '2026-01-17T13:10:00.000Z', { punctuality: 3, quality: 5, communication: 4 }),
//   rev('wrk-208', null, 'Acosta Family', 5, 'Would recommend for any rooftop solar job.', '2025-12-02T11:00:00.000Z'),

//   /* --- wrk-209 Rhoda Ignacio (Plumbing/Sup, 4.7 / 52 jobs) ------------- */
//   rev('wrk-209', null, 'Northpoint Dormitory', 5, 'Handled a tricky multi-floor plumbing rework expertly.', '2026-03-20T10:00:00.000Z'),
//   rev('wrk-209', null, 'Cabrera Apartments', 5, 'Clear communicator. Great supervisor.', '2026-02-04T15:30:00.000Z'),
//   rev('wrk-209', null, 'Dizon Family', 4, 'Excellent work. Slightly over budget.', '2025-12-15T12:00:00.000Z', { punctuality: 5, quality: 5, communication: 4 }),

//   /* --- wrk-210 Emmanuel Bautista (Welding, 4.6 / 29 jobs) -------------- */
//   rev('wrk-210', 'job-123', 'Iron Works PH', 5, 'Benches are rock solid. Met every spec.', '2026-03-12T16:00:00.000Z'),
//   rev('wrk-210', null, 'Sta. Cruz Workshop', 4, 'Good welder. Cleaned up well.', '2026-01-08T14:00:00.000Z', { punctuality: 4, quality: 5, communication: 4 }),

//   /* --- wrk-211 Liza Aquino (Electrical, 3.9 / 17 jobs, flagged) -------- */
//   rev('wrk-211', null, 'Bautista Studio', 4, 'Work was fine but started late twice.', '2026-03-05T11:00:00.000Z', { punctuality: 2, quality: 5, communication: 4 }),
//   rev('wrk-211', null, 'Aragon Household', 3, 'Delays on the second day without prior notice.', '2026-02-12T16:00:00.000Z', { punctuality: 2, quality: 4, communication: 3 }, { complaint: true }),
//   rev('wrk-211', null, 'Garcia Compound', 4, 'Finished strong despite a slow start.', '2025-12-28T10:30:00.000Z', { punctuality: 3, quality: 5, communication: 4 }),

//   /* --- wrk-212 Romulo Pascual (Carpentry, 4.5 / 26 jobs) --------------- */
//   rev('wrk-212', null, 'Magsaysay Residence', 5, 'Solid cabinetry work.', '2026-02-25T13:00:00.000Z'),
//   rev('wrk-212', null, 'Limcangco Apartments', 4, 'Reliable and tidy.', '2026-01-19T10:30:00.000Z'),

//   /* --- wrk-213 Angelica Domingo (Painting, 4.4 / 21 jobs) -------------- */
//   rev('wrk-213', 'job-111', 'Mabayuan Elementary', 5, 'Classrooms look brand new. Safe working around the kids schedule.', '2026-03-31T15:00:00.000Z'),
//   rev('wrk-213', 'job-130', 'Northbay BPO', 4, 'Completed the fit-out on time. Minor touch-ups needed.', '2026-04-02T11:00:00.000Z', { punctuality: 5, quality: 4, communication: 4 }),
//   rev('wrk-213', null, 'Villa Isabel HOA', 4, 'Smooth finish and reasonable pricing.', '2026-01-24T14:00:00.000Z'),

//   /* --- wrk-214 Bernard Castillo (HVAC Senior, 4.9 / 71 jobs) ----------- */
//   rev('wrk-214', null, 'Zambales Medical Plaza', 5, 'Led the HVAC retrofit flawlessly. Clear documentation.', '2026-03-14T09:45:00.000Z'),
//   rev('wrk-214', null, 'Alpha Industrial Park', 5, 'Top-tier supervision. Zero safety issues during shutdown.', '2026-02-02T10:00:00.000Z'),
//   rev('wrk-214', null, 'Riverside Mall Admin', 5, 'Best HVAC lead we have hired. Absolute pro.', '2025-12-20T13:30:00.000Z'),
//   rev('wrk-214', null, 'CoastView Hotel', 5, 'Excellent coordination with other trades.', '2025-11-11T15:00:00.000Z'),

//   /* --- wrk-216 Ferdinand Cruz (Solar, 4.6 / 24 jobs) ------------------- */
//   rev('wrk-216', null, 'SunPath Retail', 5, 'Clean install. Production matches estimate.', '2026-03-02T10:00:00.000Z'),
//   rev('wrk-216', null, 'Navarro Residence', 4, 'Good work, communicated throughout.', '2026-01-22T15:30:00.000Z'),

//   /* --- wrk-218 Edgar Ocampo (Auto/Machine, 4.3 / 33 jobs) -------------- */
//   rev('wrk-218', null, 'Mechanica Shop Olongapo', 4, 'Reliable machine ops. Good mentor to juniors.', '2026-03-18T13:00:00.000Z'),
//   rev('wrk-218', null, 'Subic Fleet Services', 4, 'Handled our truck inspections well.', '2026-02-06T11:30:00.000Z'),

//   /* --- wrk-220 Roderick Flores (Heavy Eqpt, 3.2 / 41 jobs, banned) ----- */
//   rev('wrk-220', null, 'Bravo Construction Supply', 2, 'Operator showed up without full PPE, site foreman had to intervene.', '2026-02-15T10:00:00.000Z', { punctuality: 3, quality: 3, communication: 2 }, { complaint: true }),
//   rev('wrk-220', null, 'Horizon Lot Clearing Corp', 3, 'Got the job done but took shortcuts with the equipment.', '2026-01-03T14:00:00.000Z', { punctuality: 4, quality: 2, communication: 3 }, { complaint: true }),
//   rev('wrk-220', null, 'Palamano Logistics', 2, 'Near-miss on-site. Lost confidence.', '2025-12-05T15:30:00.000Z', { punctuality: 3, quality: 2, communication: 2 }, { complaint: true }),

//   /* --- wrk-221 Shirley Mercado (Plumbing, 4.5 / 28 jobs) --------------- */
//   rev('wrk-221', null, 'Alarilla Household', 5, 'Professional plumber. Explained everything.', '2026-03-10T11:00:00.000Z'),
//   rev('wrk-221', null, 'Chan Compound', 4, 'Good work. Finished on schedule.', '2026-01-28T14:30:00.000Z'),

//   /* --- wrk-222 Jonathan Ramos (Solar/Elec Senior, 4.8 / 55 jobs) ------- */
//   rev('wrk-222', null, 'Sibugay Housing Project', 5, 'Outstanding lead installer. Ran a tight crew.', '2026-03-06T10:00:00.000Z'),
//   rev('wrk-222', null, 'Dimaano Residence', 5, 'Educated us on maintenance. 5 stars.', '2026-02-03T13:00:00.000Z'),
//   rev('wrk-222', null, 'GreenLeaf Resort', 5, 'Best electrical/solar combo we found in the area.', '2025-12-10T15:00:00.000Z'),

//   /* --- wrk-223 Patricia Yap (Painting Sup, 4.6 / 34 jobs) -------------- */
//   rev('wrk-223', 'job-120', 'Banicain Heights HOA', 5, 'Mural turned out beautifully. Great coordination.', '2026-03-20T11:00:00.000Z'),
//   rev('wrk-223', 'job-130', 'Northbay BPO', 5, 'Handled the painting side of our office fit-out very well.', '2026-04-02T14:00:00.000Z'),
//   rev('wrk-223', null, 'Morales Homes', 4, 'Nice finish. Slight delay on final coat.', '2026-01-16T12:00:00.000Z', { punctuality: 4, quality: 5, communication: 4 }),

//   /* --- wrk-224 Victor Navarro (Welding, 2.9 / 14 jobs, banned) --------- */
//   rev('wrk-224', null, 'RoadStar Fabrication', 3, 'Work was passable but welds were uneven.', '2026-02-18T16:00:00.000Z', { punctuality: 3, quality: 2, communication: 3 }, { complaint: true }),
//   rev('wrk-224', null, 'Eastwind Rentals', 2, 'Abandoned the job mid-way. Had to hire replacement.', '2026-01-09T10:00:00.000Z', { punctuality: 2, quality: 2, communication: 1 }, { noShow: true, complaint: true }),

//   /* --- wrk-225 Melissa Cabrera (HVAC, 4.5 / 25 jobs) ------------------- */
//   rev('wrk-225', null, 'Belmont Dormitories', 4, 'Solid service. Would hire again.', '2026-03-07T10:00:00.000Z'),
//   rev('wrk-225', null, 'Ticson Residence', 5, 'Prompt and efficient.', '2026-01-25T14:30:00.000Z'),

//   /* --- wrk-226 Archie Lagman (Carp/Masonry Sen, 4.8 / 58 jobs) --------- */
//   rev('wrk-226', null, 'Aquino Compound Phase 2', 5, 'Elite tradesman. Led our project start to finish.', '2026-03-09T15:00:00.000Z'),
//   rev('wrk-226', null, 'Valencia Home Renovation', 5, 'Flawless craftsmanship.', '2026-02-01T11:00:00.000Z'),
//   rev('wrk-226', null, 'Romero Family', 5, 'Master carpenter and mason. Rare combo.', '2025-12-28T13:30:00.000Z'),

//   /* --- wrk-228 Crisanto Buenviaje (Roofing/Carp, 4.4 / 20 jobs) -------- */
//   rev('wrk-228', null, 'Santa Lucia HOA', 4, 'Good work. On schedule.', '2026-02-21T10:00:00.000Z'),
//   rev('wrk-228', null, 'Gutierrez Residence', 5, 'Roofing looks great after the repair.', '2026-01-14T14:00:00.000Z'),

//   /* --- wrk-229 Lorna Padilla (Solar, 4.6 / 27 jobs) -------------------- */
//   rev('wrk-229', 'job-127', 'Mendoza Residence', 5, 'Thorough inspection and cleaning. Clear report.', '2026-03-21T11:00:00.000Z'),
//   rev('wrk-229', null, 'EcoBright Residences', 5, 'Knowledgeable and safe. Best in class.', '2026-02-09T15:00:00.000Z'),

//   /* --- wrk-230 Renato Agustin (Plumb/HVAC, 3.8 / 15 jobs, flagged) ----- */
//   rev('wrk-230', null, 'Villar Household', 4, 'Work okay but missed our agreed start time.', '2026-02-27T13:00:00.000Z', { punctuality: 2, quality: 5, communication: 3 }),
//   rev('wrk-230', null, 'Centeno Compound', 3, 'Second day no-show without warning.', '2026-01-22T10:00:00.000Z', { punctuality: 1, quality: 4, communication: 2 }, { noShow: true, complaint: true }),

//   /* --- wrk-232 Armando Dizon (Masonry/Tile Sen, 4.9 / 82 jobs) --------- */
//   rev('wrk-232', 'job-105', 'UrbanRise Projects', 5, 'Anchored the masonry crew. Superb finish.', '2026-03-01T09:30:00.000Z'),
//   rev('wrk-232', null, 'Casa Maria Residences', 5, 'Consistently the best mason we hire.', '2026-01-10T12:00:00.000Z'),
//   rev('wrk-232', null, 'Dimaguiba Residence', 5, 'Decades of experience show in every detail.', '2025-11-20T14:30:00.000Z'),

//   /* --- wrk-233 Bella Morales (Painting, 4.4 / 19 jobs) ----------------- */
//   rev('wrk-233', null, 'Subic Rental Townhouses', 4, 'Tidy painter. Good attention to edges.', '2026-02-18T10:00:00.000Z'),
//   rev('wrk-233', null, 'Galang Homestead', 5, 'Lovely finish. Recommended.', '2026-01-06T14:30:00.000Z'),

//   /* --- wrk-234 Dennis Escobar (Welding/Auto, 3.6 / 18 jobs, flagged) -- */
//   rev('wrk-234', null, 'Gonzales Body Shop', 3, 'Welds acceptable but fit-up was rough.', '2026-02-24T11:00:00.000Z', { punctuality: 4, quality: 3, communication: 3 }, { complaint: true }),
//   rev('wrk-234', null, 'RidgeLine Trucking', 4, 'Finished the job eventually. Needed follow-up.', '2026-01-11T15:30:00.000Z', { punctuality: 3, quality: 4, communication: 3 }),

//   /* --- wrk-235 Yolanda Gabriel (Safety Sup, 4.8 / 61 jobs) ------------- */
//   rev('wrk-235', null, 'Alpha Industrial Park', 5, 'Top-notch safety officer. Kept everyone compliant.', '2026-03-04T10:00:00.000Z'),
//   rev('wrk-235', null, 'Subic Bay Port Admin', 5, 'Dependable and detail-oriented.', '2026-01-18T13:00:00.000Z'),
//   rev('wrk-235', null, 'Pacific Container Yard', 5, 'Gold standard safety practices.', '2025-12-02T11:30:00.000Z'),

//   /* --- wrk-236 Paolo Manalo (Heavy Eqpt, 2.7 / 10 jobs, banned) -------- */
//   rev('wrk-236', null, 'Ramos Demolition Services', 2, 'No-show twice. Project suffered.', '2026-01-30T10:00:00.000Z', { punctuality: 1, quality: 3, communication: 2 }, { noShow: true, complaint: true }),
//   rev('wrk-236', null, 'BayView Lot Clearing', 3, 'Some equipment handling issues on site.', '2025-12-22T14:00:00.000Z', { punctuality: 3, quality: 3, communication: 3 }, { complaint: true }),

//   /* --- wrk-237 Arnel Cabuhat (Elec/HVAC/Solar Sen, 4.9 / 66 jobs) ------ */
//   rev('wrk-237', null, 'Greenfield Technology Park', 5, 'Three-in-one specialist. Invaluable on our retrofit.', '2026-03-13T11:00:00.000Z'),
//   rev('wrk-237', null, 'Sunwave Plaza', 5, 'Best all-around technician we have booked.', '2026-02-07T14:00:00.000Z'),
//   rev('wrk-237', null, 'Crescent Hotels Group', 5, 'Polished, reliable, knowledgeable.', '2025-12-15T15:30:00.000Z'),

//   /* --- wrk-239 Wilfredo Bartolome (Welding Master, 4.9 / 94 jobs) ------ */
//   rev('wrk-239', 'job-116', 'Atty. Lorenzo Diaz', 5, 'Stunning stainless handrails. A true craftsman.', '2026-03-24T10:00:00.000Z'),
//   rev('wrk-239', 'job-123', 'Iron Works PH', 5, 'Delivered on complex specs. No rework needed.', '2026-03-12T16:30:00.000Z'),
//   rev('wrk-239', null, 'North Olongapo Metalworks', 5, 'Our go-to for anything welding supervision.', '2026-01-21T13:00:00.000Z'),
//   rev('wrk-239', null, 'Lantin Engineering', 5, 'Exceptional. Would hire again in a heartbeat.', '2025-11-15T15:00:00.000Z'),

//   /* --- wrk-240 Isabel Vasquez (Plumbing, 3.9 / 16 jobs, flagged) ------- */
//   rev('wrk-240', null, 'Zaragoza Residence', 4, 'Work quality good. Payment dispute left a sour taste.', '2026-02-16T11:00:00.000Z', { punctuality: 4, quality: 5, communication: 2 }, { complaint: true }),
//   rev('wrk-240', null, 'Ponce Family', 4, 'Repaired our pipes well. Billed above agreed amount.', '2026-01-04T14:30:00.000Z', { punctuality: 4, quality: 4, communication: 3 }, { complaint: true }),
// ];

// export default ratings;
